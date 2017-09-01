import { VZ } from '/imports/startup/both/namespace';

import './assign-user-modal/assign-user-modal';
import './assigned-user-item/assigned-user-item';
import './assigning-users.html';

Template.assigningUsers.onCreated(function () {
    this.shouldDisplayAssignUsersInput = new ReactiveVar(false);

    this.assignedUsers = new ReactiveArray([]);

    var self = this;
    var userPositions = this.data.params.userPositions;

    var getUserWithPositions = function (userId, userPosition) {
        var targetEntityId = self.data.targetEntity._id;
        var userRoles = Roles.getRolesForUser(userId, targetEntityId);
        // because, getRoles for user return global roles too, so I need only that roles, that
        // exist in positions for this entity
        var rolesFromAllPositions = [];
        userPositions.forEach(function (userPosition) {
            rolesFromAllPositions = _.union(rolesFromAllPositions, userPosition.roles);
        });
        userRoles = _.intersection(userRoles, rolesFromAllPositions);

        var assignedUsers = self.assignedUsers.array();
        var assignedUser = _.find(assignedUsers, function (assignedUser) {
            return assignedUser._id == userId;
        });
        if (!assignedUser) {
            assignedUser = {
                _id: userId,
                positions: []
            }
        }

        var symmetricDiff = _.union(_.difference(userRoles, userPosition.roles),
            _.difference(userPosition.roles, userRoles));
        if (symmetricDiff.length == 0) {
            assignedUser.positions.push(userPosition);
        }
        return assignedUser;
    };

    userPositions.forEach(function (userPosition) {
        var users = self.data.targetEntity[userPosition.propertyNameInCollection] || [];
        users.forEach(function (user) {
            var userId = _.isObject(user) ? user.id || user._id : user;
            var assignedUser = getUserWithPositions(userId, userPosition);
            self.assignedUsers.remove(function (user) {
                return user._id == userId;
            });
            self.assignedUsers.push(assignedUser);
        });
    });

    self.assignedUsersBeforeChanges = self.assignedUsers.array();

    self.openAssignUserModal = function (userId, assignedToUserPositions) {
        var allAvailableUsersPositions = self.data.params.userPositions;

        var modalData = {
            onAssignUser: function (userWithPositions) {
                self.assignedUsers.remove(function (assignedUser) {
                    return assignedUser._id == userWithPositions._id;
                });
                self.assignedUsers.push(userWithPositions);
                self.shouldDisplayAssignUsersInput.set(false);
            },
            userId: userId,

            // all user position that available for current entity, like
            // manager(['company-worker', 'company-manager']), worker(['company-worker'])
            userPositions: allAvailableUsersPositions,
            assignedToUserPositions: assignedToUserPositions
        };
        var parentNode = $('body')[0];
        Blaze.renderWithData(Template.assignUserModal, modalData, parentNode);
    };

    self.goBack = function () {
        var backwardRoute = self.data.params.backwardRoute;
        Router.go(backwardRoute.route, backwardRoute.params);
    };

    self.autorun(function () {
        // subscribe on assignedUsers
        var alreadyAssignedUsers = self.assignedUsers.list();
        var alreadyAssignedUsersIds = _.map(alreadyAssignedUsers, function (user) {
            return user._id;
        });
        self.subscribe('assignedUsers', alreadyAssignedUsersIds);
    });
});

Template.assigningUsers.helpers({
    assignedUsers: function () {
        return Template.instance().assignedUsers.list();
    },

    shouldDisplayAssignUsersInput: function () {
        return Template.instance().shouldDisplayAssignUsersInput.get();
    },

    assignUserCb: function () {
        var tmpl = Template.instance();
        return function (userId) {
            tmpl.openAssignUserModal(userId);
        };
    },

    onChangeRolesCb: function () {
        var tmpl = Template.instance();
        return function (userId, userPositions) {
            tmpl.openAssignUserModal(userId, userPositions);
        }
    },

    onRemoveUserCb: function () {
        var tmpl = Template.instance();

        return function (userId) {
            tmpl.assignedUsers.remove(function (userToRemove) {
                return userToRemove._id == userId;
            });
        }
    },

    changesWereMade: function () {
        var tmpl = Template.instance();
        var assignedUsersBefore = tmpl.assignedUsersBeforeChanges.slice(0);
        var assignedUsersNow = tmpl.assignedUsers.list().array();

        if (assignedUsersBefore.length != assignedUsersNow.length) {
            return true;
        }

        var notChangedUsers = [];
        assignedUsersBefore.forEach(function (userBefore) {
            var notChangedUser = _.find(assignedUsersNow, function (userNow) {
                return _.isEqual(userNow, userBefore);
            });
            if (!!notChangedUser) {
                notChangedUsers.push(notChangedUser);
            }
        });
        return notChangedUsers.length != assignedUsersBefore.length;
    },

    excludedUsersIds: function () {
        var ids = Template.instance().assignedUsers.list().array().map(function (user) {
            return user._id;
        });
        ids.push(Meteor.userId());
        ids.push(this.targetEntity.ownerId);

        return ids;
    }
});

Template.assigningUsers.events({
    'click .show-assignUser-input-icon': function (event, tmpl) {
        tmpl.shouldDisplayAssignUsersInput.set(true);
    },

    'click .add-assignedUser-icon': function (event, tmpl) {
        tmpl.shouldDisplayAssignUsersInput.set(false);
    },

    'click .remove-user-icon': function (event, tmpl) {
        tmpl.shouldDisplayAssignUsersInput.set(false);
    },

    'click .cancel-add-assignedUser-icon': function (event, tmpl) {
        tmpl.shouldDisplayAssignUsersInput.set(false);
    },

    'submit #assignUserToEntityForm': function (event, tmpl) {
        event.preventDefault();

        var methodName = tmpl.data.params.methodForAssignUsersToEntityName;
        var targetEntityId = tmpl.data.targetEntity._id;
        var assignedUsers = tmpl.assignedUsers.array();
        Meteor.call(methodName, targetEntityId, assignedUsers,
            tmpl.assignedUsersBeforeChanges, function (err, res) {
                if (err) {
                    console.log(err);
                    VZ.notify("Failed to assign user, try again");
                } else {
                    tmpl.goBack();
                }
            });
    },

    'click .cancel-button': function (event, tmpl) {
        event.preventDefault();
        tmpl.goBack();
    }
});
