import { VZ } from '/imports/startup/both/namespace';
import {Meteor} from 'meteor/meteor';
import { GoogleApi } from '/imports/api/google-services/server/google-api/connector';
import {Skills} from '/imports/api/skills/skills.js';

VZ.Server.UserRoles = {};

VZ.Server.UserRoles.fillAssignedUsersMap = function (assignedUsers, allPositionsForThisEntity) {
    var assignedUsersMap = {};

    allPositionsForThisEntity.forEach(function (position) {
        var usersForThisPositionIds = [];
        assignedUsers.forEach(function (userWithPositions) {
            var hasCurrentPosition =
                _.find(userWithPositions.positions, function (assignedPosition) {
                    return assignedPosition.title == position.title;
                });
            if (hasCurrentPosition) {
                usersForThisPositionIds.push(userWithPositions._id);
            }
        });
        if (assignedUsersMap[position.propertyNameInCollection]) {
            assignedUsersMap[position.propertyNameInCollection] =
                _.uniq(_.union(assignedUsersMap[position.propertyNameInCollection],
                    usersForThisPositionIds));
        } else {
            assignedUsersMap[position.propertyNameInCollection] = usersForThisPositionIds;
        }
    });
    return assignedUsersMap;
};

// this is a slightly scary code, but it's works
VZ.Server.UserRoles.changeUserRoles = function (targetEntityId, assignedUsersBeforeChanges,
                                                assignedUsersAfterChanges, availablePositions) {

    var checkWhetherRoleCanBeChanged = function (assignedUsersSetOne,
                                                 assignedUsersSetTwo) {
        assignedUsersSetOne.forEach(function (userFromSetOne) {
            var userAfterChanges = _.find(assignedUsersSetTwo, function (userFromSetTwo) {
                return userFromSetTwo._id == userFromSetOne._id;
            });

            var positionsNamesBefore = _.map(userFromSetOne.positions, function (position) {
                return position.name;
            });
            var positionsNamesAfter = !!userAfterChanges ?
                _.map(userAfterChanges.positions, function (position) {
                    return position.name;
                }) : [];
            var addedPositionsNames = _.difference(positionsNamesAfter, positionsNamesBefore);
            var removedPositionsNames = _.difference(positionsNamesBefore, positionsNamesAfter);
            var changedPositionsNames = _.union(addedPositionsNames, removedPositionsNames);

            if (changedPositionsNames.length > 0) {
                if (userFromSetOne._id == Meteor.userId()) {
                    throw new Meteor.Error('You can\'t change your own role!');
                }

                changedPositionsNames.forEach(function (changedPositionName) {
                    var changedPosition = _.find(availablePositions, function (availablePosition) {
                        return availablePosition.name == changedPositionName;
                    });
                    var whoCanChangeThisPosition = changedPosition.canBeAssignedBy; // array with roles
                    var canBeChanged =
                        Roles.userIsInRole(Meteor.userId(), whoCanChangeThisPosition, targetEntityId);
                    if (!canBeChanged) {
                        throw new Meteor.Error('You can\'t assign or reject this user!');
                    }
                });
            }
        });
    };

    var removeRolesFromUser = function (targetEntityId, assignedUsersBeforeChanges) {
        assignedUsersBeforeChanges.forEach(function (assignedUserBefore) {
            var rolesBefore = [];
            assignedUserBefore.positions.forEach(function (positionBefore) {
                rolesBefore = _.union(rolesBefore, positionBefore.roles);
            });
            Roles.removeUsersFromRoles(assignedUserBefore._id, rolesBefore, targetEntityId);
        });
    };
    var addRolesToUser = function (targetEntityId, assignedUsersAfterChanges) {
        assignedUsersAfterChanges.forEach(function (assignedUser) {
            var roles = [];
            assignedUser.positions.forEach(function (position) {
                roles = _.union(roles, position.roles);
            });
            Roles.addUsersToRoles(assignedUser._id, roles, targetEntityId);
        });
    };

    // checking entities that was changed or removed
    checkWhetherRoleCanBeChanged(assignedUsersBeforeChanges, assignedUsersAfterChanges);
    // checking entities that was changed or added (yes, I know that it's a little crutch bike)
    checkWhetherRoleCanBeChanged(assignedUsersAfterChanges, assignedUsersBeforeChanges);

    //(another one crutch bike; maybe, I'll rewrite this in future)
    // I removing roles that was before
    removeRolesFromUser(targetEntityId, assignedUsersBeforeChanges);
    // and adding roles that are now
    addRolesToUser(targetEntityId, assignedUsersAfterChanges);
};

VZ.Server.UserRoles.searchChanges = function (after, before) {

    var userIdsBefore = _.map(before, function (obj) {
        return obj._id;
    });

    var userIdsAfter = _.map(after, function(obj) {
        return obj._id;
    });

    var addedUsers = _.difference(userIdsAfter, userIdsBefore);
    var removedUsers = _.difference(userIdsBefore, userIdsAfter);

    var stayedUsers = _.intersection(userIdsBefore, userIdsAfter);
    var changedUsers = [];
    _.each(stayedUsers, function (id) {
        var userBefore = _.find(before, function (obj) {
            return obj._id === id
        });

        var userAfter = _.find(after, function (obj) {
            return obj._id === id
        });

        if(userBefore.positions.length != userAfter.positions.length){
            var privilege = userBefore.positions.length > userAfter.positions.length ? "unassigned" : "assigned";

            changedUsers.push({
                id: id,
                privilege: privilege
            });
        }
    });

    return {
        addedUsers: addedUsers,
        removedUsers: removedUsers,
        changedUsers: changedUsers
    }
};

Meteor.methods({
    'addSearchQuery': function (query) {
        check(query, String);
        var userId = this.userId;
        if (userId) {
            var user = Meteor.users.findOne({_id: userId});
            if (user.profile.searchHistory) {
                var searchHistory = user.profile.searchHistory;
                searchHistory.push(query);
                searchHistory = _.uniq(searchHistory).slice(-30);
            } else {
                var searchHistory = [query];
            }

            Meteor.users.update({_id: userId}, {
                $set: {
                    "profile.searchHistory": searchHistory
                }
            })
        }
    }
});

/////users/methods
Meteor.methods({
    updateProfile: function (params) {
        var skills = Skills.find({label: {$in: params.skills}}).fetch();
        var skillsIds = _.map(skills, function (skill) {
            return skill._id;
        });

        var userId = this.userId;
        if (userId) {
            var fullName = params.firstName + ' ' + params.lastName;
            var userParams = {
                'profile.firstName': params.firstName,
                'profile.lastName': params.lastName,
                'profile.fullName': fullName,
                'profile.overview': params.overview,
                'profile.location': params.location,
                'profile.skills': skillsIds,
                'profile.hourlyRate': params.hourlyRate,
                'profile.availabilityTime': params.availabilityTime,
                'profile.getInvitations': params.getInvitations
            };
            Meteor.users.update({_id: userId}, {$set: userParams}, function (err) {
                if (err) {
                    console.log(err);
                    throw new Meteor.Error('Update fail');
                }
            });
        }
    },
    updatePaswordChange: function () {
        var userId = this.userId;
        if (userId) {
            var date = new Date();
            var userParams = {
                'profile.passwordUpdated': date
            };
            Meteor.users.update({_id: userId}, {$set: userParams}, function (err) {
                if (err) {
                    console.log(err);
                    throw new Meteor.Error('Update fail');
                }
            });
        }
    },
    updateProfileMedia: function (params) {
        var userId = this.userId;
        if (userId) {
            var userParams = {
                'profile.languages': params.languages,
                'profile.personalWebsite': params.personalWebsite,
                'profile.socialMedias': params.socialMedias
            };
            Meteor.users.update({_id: userId}, {$set: userParams}, function (err) {
                if (err) {
                    console.log(err);
                    throw new Meteor.Error('Update fail');
                }
            });
        }
    },

    changeAvailability: function (availability) {
        var userId = this.userId;
        Meteor.users.update(
            {_id: userId},
            {$set: {'profile.availability': availability}},
            function (err) {
                if (err) {
                    console.log(err);
                    throw new Meteor.Error('Failed');
                }
            }
        );
    },

    editBiography: function (biography) {
        var userId = this.userId;
        if (userId) {
            Meteor.users.update({_id: userId}, {$set: {'profile.biography': biography}}, function (err) {
                if (err) {
                    console.log(err);
                    throw new Meteor.Error('Failed');
                }
            });
        }
    },

    'closeAccount': function () {
        var userId = this.userId;
        if (userId) {
            Meteor.users.update({_id: userId}, {$set: {status: 'closed'}}, function (err) {
                if (err) {
                    console.log(err);
                    throw new Meteor.Error('Account close failed');
                }
            });
        }
    },

    editName: function (firstName, lastName) {
        var userId = this.userId;
        if (userId && firstName && lastName) {
            var fullName = firstName + ' ' + lastName;
            Meteor.users.update(
                {_id: userId},
                {$set: {'profile.firstName': firstName, 'profile.lastName': lastName, 'profile.fullName': fullName}},
                function (err) {
                    if (err) {
                        console.log(err);
                        throw new Meteor.Error('Name editing failed');
                    }
                }
            );
        }
    },

    editDescription: function (description) {
        var userId = this.userId;
        if (userId) {
            Meteor.users.update(
                {_id: userId},
                {$set: {'profile.description': description}},
                function (err) {
                    if (err) {
                        console.log(err);
                        throw new Meteor.Error('Description editing failed');
                    }
                }
            );
        }
    },

    editCard: function (data, profileField) {
        var userId = this.userId,
            setQuery = {};
        setQuery['profile.' + profileField] = data;
        if (userId && data && profileField) {
            Meteor.users.update(
                {_id: userId},
                {$set: setQuery},
                function (err) {
                    if (err) {
                        console.log(err);
                        throw new Meteor.Error('Card editing failed');
                    }
                }
            );
        }
    },

    getLargePhoto: function (userId) {
        if (!userId) {
            var userId = this.userId;
        }

        var Google = new GoogleApi();
        var bucket = 'vezio_avatars';
        var name = userId + '_large';
        return Google.getFile(bucket, name, function (err, res) {
            if (err) {
                console.log(err);
                throw new Meteor.Error('Failed to download or not set')
            }
            else {
                return res.data.mediaLink
            }
        })
    },

    updateUserLocation: function (locationObj) {
        var userId = this.userId;
        if (userId) {
            Meteor.users.update({_id: userId}, {$set: {'profile.location': locationObj}})
        }
    },

    removeUserSkill: function (skill) {
        var userId = this.userId;
        check(skill, String);
        if (userId) {
            var skills = Meteor.users.findOne({_id: userId}).profile.skills;
            skills = _.reject(skills, function (skillItem) {
                return skillItem === skill
            });
            Meteor.users.update({_id: userId}, {$set: {'profile.skills': skills}});
        }
    },

    addUserSkill: function (skill) {
        var userId = this.userId;
        check(skill, String);
        if (userId) {
            var skills = Meteor.users.findOne({_id: userId}).profile.skills;
            if (_.isArray(skills)) {
                skills.push(skill);
            } else {
                skills = [skill]
            }

            Meteor.users.update({_id: userId}, {$set: {'profile.skills': skills}});
        }
    },

    updateBackgroundPhoto: function (buffer, type) {
        var userId = this.userId;
        if (userId) {
            var params = {
                name: userId,
                type: type,
                buffer: buffer,
                bucketName: 'vezio_profile_backgrounds'
            };
            try {
                var mediaLink = Meteor.call('uploadPhoto', params);
                console.log(mediaLink);
                Meteor.users.update({_id: userId}, {$set: {'profile.photo.background': mediaLink}});
            } catch (e) {
                return e;
            }
        }
    },

    checkResetPasswordToken: function (token) {
        var userWithThisToken = Meteor.users.findOne({
            'services.password.reset.token': token
        });

        if (userWithThisToken) {
            var passwordResetData = userWithThisToken.services.password.reset;
            var tokenWasTakenAtMoment = moment(passwordResetData.when);
            var currentMoment = moment();

            var diff = currentMoment.diff(tokenWasTakenAtMoment, 'minutes');

            var tokenExpiredInterval = 10;
            // token valid for 10 minutes
            if (diff < tokenExpiredInterval) {
                return true;
            } else {
                throw  new Meteor.Error('Tokes was expired!');
            }
        } else {
            throw new Meteor.Error('Token is invalid!');
        }
    },
    setTimeLogout: function (user) {
        var logOutTime = new Date();
        Meteor.users.update({_id: user._id}, {$set: {'profile.lastOnline': logOutTime}});
    },
    setPassword: function (password) {
        var userId = this.userId;
        Accounts.setPassword(userId, password, {logout: false});
    },
    archiveUser: function (userId, archivedBy) {
        var currentUserId = this.userId;
        if (currentUserId) {
            var archivedAt = new Date();
            var user = Meteor.users.findOne({_id: userId});
            if (user) {
                Meteor.users.update({_id: userId}, {$set: {'profile.isArchived': true, 'profile.archivedAt': archivedAt, 'profile.archivedBy': archivedBy}});
            }
            else {
                throw new Meteor.Error('User not found');
            }
        }
    },
    restoreUser: function (userId) {
        var currentUserId = this.userId;
        if (currentUserId) {
            var user = Meteor.users.findOne({_id: userId});
            if (user) {
                Meteor.users.update({_id: userId}, {$set: {'profile.isArchived': false}});
            }
            else {
                throw new Meteor.Error('User not found');
            }
        }
    },
    blockUser: function (userId, blockedBy, blockedWhy) {
        var currentUserId = this.userId;
        if (currentUserId) {
            var blockedAt = new Date();
            var user = Meteor.users.findOne({_id: userId});
            if (user) {
                Meteor.users.update({_id: userId}, {$set: {'profile.isBlocked': true, 'profile.blockedAt': blockedAt, 'profile.blockedBy': blockedBy, 'profile.blockedWhy': blockedWhy}});
            }
            else {
                throw new Meteor.Error('User not found');
            }
        }
    },
    unblockUser: function (userId) {
        var currentUserId = this.userId;
        if (currentUserId) {
            var user = Meteor.users.findOne({_id: userId});
            if (user) {
                Meteor.users.update({_id: userId}, {$set: {'profile.isBlocked': false}});
            }
            else {
                throw new Meteor.Error('User not found');
            }
        }
    },
    archiveUsers: function (userIds, archivedBy) {
        var currentUserId = this.userId;
        if (currentUserId) {
            var archivedAt = new Date();
            Meteor.users.update({_id: {$in: userIds}}, {$set: {'profile.isArchived': true, 'profile.archivedAt': archivedAt, 'profile.archivedBy': archivedBy}}, {multi: true});
        }
    },
    restoreUsers: function (userIds) {
        var currentUserId = this.userId;
        if (currentUserId) {
            Meteor.users.update({_id: {$in: userIds}}, {$set: {'profile.isArchived': false}}, {multi: true});
        }
    },
    blockUsers: function (userIds, blockedBy, blockedWhy) {
        var currentUserId = this.userId;
        if (currentUserId) {
            var blockedAt = new Date();
            Meteor.users.update({_id: {$in: userIds}}, {$set: {'profile.isBlocked': true, 'profile.blockedAt': blockedAt, 'profile.blockedBy': blockedBy, 'profile.blockedWhy': blockedWhy}}, {multi: true});
        }
    },
    unblockUsers: function (userIds) {
        var currentUserId = this.userId;
        if (currentUserId) {
            Meteor.users.update({_id: {$in: userIds}}, {$set: {'profile.isBlocked': false}}, {multi: true});
        }
    }
});
////users
Meteor.methods({

    confirmEmail: function (userId) {
        if (userId && VZ.helpers.isDev()) {

            var user = Meteor.users.find(userId).fetch()[0];

            if (user.emails && user.emails.length != 0) {
                var emails = user.emails;
                emails[0].verified = true;
                Meteor.users.update({_id: userId}, {$set: {'emails': emails}})
            }
            else return false;

            return true;

        }
    },

    removeUser: function () {

        Meteor.users.remove(this.userId);

    },

    removeAllUsers: function () {

        Meteor.users.remove({});

    }
});