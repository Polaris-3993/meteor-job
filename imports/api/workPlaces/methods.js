import { Tools } from '/imports/api/tools/tools';
import { Workplaces } from './workPlaces';
import { VZ } from '/imports/startup/both/namespace';

Meteor.methods({
    'updateState': function (workplaceId, state) {
        var userId = this.userId;

        if (userId) {
            if (VZ.canUser('updateWorkplaceState', this.userId, workplaceId)) {
                Workplaces.update({_id: workplaceId}, {$set: {state: state}});
            } else {
                throw new Meteor.Error('You can\'t change state of this workplace!')
            }
        } else {
            throw new Meteor.Error('You should be logged in!');
        }
    },

    'createWorkplace': function (insertQuery) {
        var userId = this.userId;
        if (userId) {
            var newFields = {
                ownerId: userId,
                createdAt: new Date()
            };
            _.extend(insertQuery, newFields);
            var workplaceId = Workplaces.insert(insertQuery);
            Roles.addUsersToRoles(userId, ['workplace-admin'], workplaceId);

            var user = Meteor.users.findOne({_id: this.userId});
            var notificationMsg = "Workplace - " + insertQuery.name + " - added by " + user.profile.fullName + " -"
            Meteor.call("sendNotifications", "Workplace created", notificationMsg, this.userId);

            return workplaceId;
        } else {
            throw new Meteor.Error('You should be logged in!');
        }
    },

    'editWorkplace': function (updateQuery) {
        var userId = this.userId;

        if (userId) {
            if (VZ.canUser('updateWorkplaceState', this.userId, updateQuery._id)) {
                updateQuery.editedAt = new Date();
                updateQuery.editedBy = userId;
                var workplace = Workplaces.findOne({_id: updateQuery._id});

                var toolsIdsBeforeUpdate = _.map(workplace.tools, function (tool) {
                    return tool._id
                });

                var toolsIdsAfterUpdate = _.map(updateQuery.tools, function (tool) {
                    return tool._id
                });

                var addedTools = _.difference(toolsIdsAfterUpdate, toolsIdsBeforeUpdate);
                var removedTools = _.difference(toolsIdsAfterUpdate, toolsIdsBeforeUpdate);

                Workplaces.update({_id: updateQuery._id}, {$set: updateQuery});

                var workplaceUsers = updateQuery.assignedUsersIds;
                if (workplaceUsers) {
                    workplaceUsers.push(workplace.ownerId);
                }

                if (addedTools.length > 0) {
                    workplaceUsers.push(workplace.ownerId);

                    _.each(addedTools, function (toolId) {
                        var tool = Tools.findOne({_id: toolId});
                        var msg = "Tool " + tool.name + " added to workplace " + workplace.name + " by user " + user.profile.fullName;
                        Meteor.call("sendNotifications", "Tool added to workplace", msg, workplaceUsers);
                    });

                    if (removedTools.length > 0) {
                        _.each(removedTools, function (toolId) {
                            var tool = Tools.findOne({_id: toolId});
                            var msg = "Tool " + tool.name + " removed from workplace " + workplace.name + " by user " + user.profile.fullName;
                            Meteor.call("sendNotifications", "Tool removed from workplace", msg, workplaceUsers);
                        })
                    }
                }
            }
        } else {
            throw new Meteor.Error('You should be logged in!');
        }
    },

    assignUsersToWorkplace: function (workplaceId, assignedUsersWithPositions,
                                      assignedUsersWithPositionsBeforeChanges) {

        var userId = this.userId;
        var user = Meteor.users.findOne({_id: userId});
        var workplaceToUpdate = Workplaces.findOne(workplaceId);

        var userChanges = VZ.Server.UserRoles.searchChanges(assignedUsersWithPositions, assignedUsersWithPositionsBeforeChanges);

        if (!workplaceToUpdate) {
            throw new Meteor.Error('Workplace is not exist!');
        }

        if (!VZ.canUser('assignUserToWorkplace', userId, workplaceId)) {
            throw new Meteor.Error('You\'re not allowed to assign users to this company!');
        }

        var availablePositions = VZ.UserRoles.Workplaces.userPositions;
        // check whether all changed positions can be updated by current user
        // and update roles after that
        VZ.Server.UserRoles.changeUserRoles(workplaceId,
            assignedUsersWithPositionsBeforeChanges, assignedUsersWithPositions, availablePositions);

        // If user roles was updated - update company workers list
        var assignedUsersMap = VZ.Server.UserRoles
            .fillAssignedUsersMap(assignedUsersWithPositions, availablePositions);
        Workplaces.update({_id: workplaceId}, {$set: assignedUsersMap});

        //----------------------NOTIFICATON SENDING---------------------
        var query = {}
        query["roles." + workplaceId] = {$in: ["workplace-manager", "workplace-admin"]}
        var managersAndAdmins = Meteor.users.find(query).fetch();
        managersAndAdmins = _.map(managersAndAdmins, function (doc) {
            return doc._id;
        })

        //added users
        if (userChanges.addedUsers.length > 0) {
            _.each(userChanges.addedUsers, function (id) {
                var changedUser = Meteor.users.findOne({_id: id});
                var msgForBosses = "Workplace member - " + changedUser.profile.fullName + " - added to Workplace " + workplaceToUpdate.name + " by " + user.profile.fullName + " -"
                var msgForUser = "You have been assigned to Workplace " + workplaceToUpdate.name + " by " + user.profile.fullName + " -"

                Meteor.call("sendNotifications", "User assigned to workplace", msgForBosses, managersAndAdmins);
                Meteor.call("sendNotifications", "Assigned to workplace", msgForUser, id);
            })
        }

        //removed users
        if (userChanges.removedUsers.length > 0) {
            _.each(userChanges.removedUsers, function (id) {
                var changedUser = Meteor.users.findOne({_id: id});
                var msgForBosses = "Workplace member - " + changedUser.profile.fullName + " - removed from Workplace " + workplaceToUpdate.name + " by " + user.profile.fullName + " -"
                var msgForUser = "You have been removed from Workplace " + workplaceToUpdate.name + " by " + user.profile.fullName + " -"

                Meteor.call("sendNotifications", "User removed from workplace", msgForBosses, managersAndAdmins);
                Meteor.call("sendNotifications", "Removed from workplace", msgForUser, id);
            })
        }

        //changed users
        if (userChanges.changedUsers.length > 0) {
            _.each(userChanges.changedUsers, function (obj) {
                var changedUser = Meteor.users.findOne({_id: obj.id});
                var msgForBosses = "Workplace member - " + changedUser.profile.fullName + " - from Workplace " + workplaceToUpdate.name + " " + obj.privilege + " privilege by " + user.profile.fullName + " - "
                var msgForUser = "Privilege " + obj.privilege + " in workplace " + workplaceToUpdate.name + " by " + user.profile.fullName + " -"

                Meteor.call("sendNotifications", "Changed privilege", msgForBosses, workplaceToUpdate.ownerId);
                Meteor.call("sendNotifications", "Changed privilege", msgForUser, obj.id)
            })
        }
    },

    associateCompanyWithWorkplace: function (workplaceId, companyId) {
        if (!VZ.canUser('associateWorkplaceWithCompany', this.userId, workplaceId)) {
            throw new Meteor.Error('You\'re not allowed to assign users to this company!');
        }

        if (companyId) {
            Workplaces.update(workplaceId, {$set: {associatedCompanyId: companyId}})
        } else {
            Workplaces.update(workplaceId, {$unset: {associatedCompanyId: ''}})
        }
    }
});