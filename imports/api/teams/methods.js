import { Teams } from './teams';
import { VZ } from '/imports/startup/both/namespace';

Meteor.methods({
    'createTeam': function (team) {
        team.ownerId = this.userId;
        team.createdAt = new Date();
        team.archived = false;


        var teamId = Teams.insert(team);
        Roles.addUsersToRoles(this.userId, 'team-admin', teamId);

        var user = Meteor.users.findOne({_id: this.userId});
        var notificationMsg = 'Team - ' + team.name + ' - added by ' + user.profile.fullName + ' -';
        Meteor.call('sendNotifications', 'Team created', notificationMsg, this.userId);
    },
    'updateTeam': function (team) {
        var teamToUpdate = Teams.findOne(team._id);

        if (VZ.canUser('editTeam', this.userId, teamToUpdate._id)) {
            Teams.update(team._id, {$set: team}, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        } else {
            throw new Meteor.Error('permission-error', 'You can\'t edit this team!');
        }
    },
    'assignMembersToTeam': function (teamId, assignedUsersWithPositions,
                                     assignedUsersWithPositionsBeforeChanges) {
        var userId = this.userId;
        var user = Meteor.users.findOne({_id: userId});
        var teamToUpdate = Teams.findOne(teamId);

        var userChanges = VZ.Server.UserRoles.searchChanges(assignedUsersWithPositions, assignedUsersWithPositionsBeforeChanges);

        if (!teamToUpdate) {
            throw new Meteor.Error('Team does not exist!');
        }

        if (!VZ.canUser('assignUserToTeam', userId, teamToUpdate._id)) {
            throw new Meteor.Error('You\'re not allowed to assign members to this team!');
        }

        var availablePositions = VZ.UserRoles.Teams.userPositions;
        // check whether all changed positions can be updated by current user
        // and update roles after that
        VZ.Server.UserRoles.changeUserRoles(teamId,
            assignedUsersWithPositionsBeforeChanges, assignedUsersWithPositions, availablePositions);

        // If user roles was updated - update company workers list
        var assignedUsersMap = VZ.Server.UserRoles
            .fillAssignedUsersMap(assignedUsersWithPositions, availablePositions);
        Teams.update({_id: teamId}, {$set: assignedUsersMap});

        //----------------------NOTIFICATON SENDING---------------------
        var query = {}
        query['roles.' + teamId] = {$in: ['team-manager', 'team-admin']};
        var managersAndAdmins = Meteor.users.find(query).fetch();
        managersAndAdmins = _.map(managersAndAdmins, function (doc) {
            return doc._id;
        });

        //added users
        if (userChanges.addedUsers.length > 0) {
            _.each(userChanges.addedUsers, function (id) {
                var changedUser = Meteor.users.findOne({_id: id});
                var msgForBosses = 'Team member - ' + changedUser.profile.fullName + ' - added to Team ' + teamToUpdate.name + ' by ' + user.profile.fullName + ' -';
                var msgForUser = 'You have been assigned to Team ' + teamToUpdate.name + ' by ' + user.profile.fullName + ' -';

                Meteor.call('sendNotifications', 'User assigned to team', msgForBosses, managersAndAdmins);
                Meteor.call('sendNotifications', 'Assigned to team', msgForUser, id);
            })
        }

        //removed users
        if (userChanges.removedUsers.length > 0) {
            _.each(userChanges.removedUsers, function (id) {
                var changedUser = Meteor.users.findOne({_id: id});
                var msgForBosses = 'Team member - ' + changedUser.profile.fullName + ' - removed from Team ' + teamToUpdate.name + ' by ' + user.profile.fullName + ' -';
                var msgForUser = 'You have been removed from Team ' + teamToUpdate.name + ' by ' + user.profile.fullName + ' -';

                Meteor.call('sendNotifications', 'User removed from team', msgForBosses, managersAndAdmins);
                Meteor.call('sendNotifications', 'Removed from team', msgForUser, id);
            })
        }

        //changed users
        if (userChanges.changedUsers.length > 0) {
            _.each(userChanges.changedUsers, function (obj) {
                var changedUser = Meteor.users.findOne({_id: obj.id});
                var msgForBosses = 'Team member - ' + changedUser.profile.fullName + ' - from Team ' + teamToUpdate.name + ' ' + obj.privilege + ' privilege by ' + user.profile.fullName + ' - ';
                var msgForUser = 'Privilege ' + obj.privilege + ' in team ' + teamToUpdate.name + ' by ' + user.profile.fullName + ' -';

                Meteor.call('sendNotifications', 'Changed privilege', msgForBosses, teamToUpdate.ownerId);
                Meteor.call('sendNotifications', 'Changed privilege', msgForUser, obj.id)
            })
        }
    },

    assignTeamToProject: function (projectId, teamIds) {

        if (!VZ.canUser('assignTeamToProject', this.userId, projectId)) {
            throw new Meteor.Error('You can\'t assign team to this project!');
        }

        var teamWithAssignedProject = Teams.findOne({
            _id: {$in: teamIds},
            assignedProjectId: {$exists: true, $ne: projectId}
        });
        if (!!teamWithAssignedProject) {
            throw new Meteor.Error('Team ' + teamWithAssignedProject.name + ' has assigned project!');
        }

        var assignedTeamsIdsBefore = [];
        Teams.find({assignedProjectId: projectId}).forEach(function (team) {
            assignedTeamsIdsBefore.push(team._id);
        });
        var removedTeamsIds = _.difference(assignedTeamsIdsBefore, teamIds);

        Teams.update({_id: {$in: teamIds}},
            {$set: {assignedProjectId: projectId}}, {multi: true});
        Teams.update({_id: {$in: removedTeamsIds}},
            {$unset: {assignedProjectId: ''}}, {multi: true});
    },
    assignTeamToCompany: function (companyId, teamIds) {

        if (!VZ.canUser('assignTeamToCompany', this.userId, companyId)) {
            throw new Meteor.Error('You can\'t assign team to this company!');
        }

        var teamWithAssignedCompany = Teams.findOne({
            _id: {$in: teamIds},
            assignedCompanyId: {$exists: true, $ne: companyId}
        });
        if (!!teamWithAssignedCompany) {
            throw new Meteor.Error('Team ' + teamWithAssignedCompany.name + ' has assigned company!');
        }

        var assignedTeamsIdsBefore = [];
        Teams.find({assignedCompanyId: companyId}).forEach(function (team) {
            assignedTeamsIdsBefore.push(team._id);
        });
        var removedTeamsIds = _.difference(assignedTeamsIdsBefore, teamIds);

        Teams.update({_id: {$in: teamIds}},
            {$set: {assignedCompanyId: companyId}}, {multi: true});
        Teams.update({_id: {$in: removedTeamsIds}},
            {$unset: {assignedCompanyId: ''}}, {multi: true});
    },
    archiveTeam: function (teamId) {
        if (VZ.canUser('archiveTeam', this.userId, teamId)) {
            Teams.update(teamId, {
                $set: {
                    archived: true
                }
            });
            // var user = Meteor.users.findOne({_id: this.userId});
            // var notificationMsg = 'Task - ' + task.name + ' - archived by ' + user.profile.fullName + ' -';
            // Meteor.call('sendNotifications', 'Task archived', notificationMsg, this.userId);
        } else {
            throw new Meteor.Error('permission-error', 'You can\'t archive this team!');
        }
    },
    archiveTeams: function (teamIds) {
        for (var i=0; i < teamIds.length; i++) {
            if (VZ.canUser('archiveTeam', this.userId, teamIds[i])) {
                Teams.update({_id: teamIds[i]}, {
                    $set: {
                        archived: true
                    }
                });
            }
            else {
                var team = Teams.findOne({_id: teamIds[i]});
                throw new Meteor.Error('permission-error', 'You can\'t archive ' + team.name+ ' team!');
            }
        }
    },
    restoreTeams: function (teamIds) {
        for (var i=0; i < teamIds.length; i++){
            if (VZ.canUser('restoreTeam', this.userId, teamIds[i])) {
                Teams.update({_id: teamIds[i]}, {
                    $set: {
                        archived: false
                    }
                });
            }
            else {
                var team = Teams.findOne({_id: teamIds[i]});
                throw new Meteor.Error('permission-error', 'You can\'t restore ' + team.name+ ' team!');
            }
        }

    },
    restoreTeam: function (teamId) {
        if (VZ.canUser('restoreTeam', this.userId, teamId)) {
            Teams.update(teamId, {
                $set: {
                    archived: false
                }
            });
            // var user = Meteor.users.findOne({_id: this.userId});
            // var notificationMsg = 'Task - ' + task.name + ' - restored by ' + user.profile.fullName + ' -';
            // Meteor.call('sendNotifications', 'Task restored', notificationMsg, this.userId);
        } else {
            throw new Meteor.Error('permission-error', 'You can\'t restore this team!');
        }
    },
});