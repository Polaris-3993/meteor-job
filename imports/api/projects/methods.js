import { Projects } from './projects';
import { Tasks } from '/imports/api/tasks/tasks';
import { VZ } from '/imports/startup/both/namespace';

Meteor.methods({
    createProject: function (project) {
        var userId = this.userId;
        if (Projects.find({projectKey: project.projectKey, ownerId: this.userId}).count() > 0) {
            throw new Meteor.Error('Project key already exist!');
        }
        project.ownerId = this.userId;
        project.createdAt = new Date();
        project.updatedAt = new Date();
        project.archived = false;
        project.assignedUsersIds = [userId];
        project.info = {};
        project.info.tasksCount = 0;
        project.info.tasksCompleted = 0;

        var projectId = Projects.insert(project);

        // owner is company admin
        Roles.addUsersToRoles(this.userId, 'project-admin', projectId);

        var user = Meteor.users.findOne({_id: this.userId});
        var notificationMsg = "Project - " + project.name + " - added by " + user.profile.fullName + " -";
        Meteor.call("sendNotifications", "Project created", notificationMsg, this.userId);
        Meteor.call('addProjectCreatedMessage', 'project-created', project.name, this.userId, projectId);
        return projectId;

    },

    updateProject: function (project, projectKey, projectFiles) {
        if (project.projectKey != projectKey && Projects.find({
                projectKey: projectKey,
                ownerId: this.userId
            }).count() > 0) {
            throw new Meteor.Error('Project key already exist!');
        }
        else {
            if (VZ.canUser('editProject', this.userId, project._id)) {
                project.projectKey = projectKey;

                Projects.update(project._id, {
                    $set: project,
                    $addToSet: {projectFiles: {$each: projectFiles}}
                }, function (err) {
                    if (err) {
                    }
                });
            } else {
                throw new Meteor.Error('permission-error', 'You can\'t edit this project!');
            }
        }
    },

    archiveProject: function (projectId) {
        if (VZ.canUser('archiveProject', this.userId, projectId)) {
            var project = Projects.findOne({_id: projectId});
            Projects.update(projectId, {
                $set: {
                    archived: true,
                    updatedAt: new Date()

                }
            });
            Tasks.update({projectId: projectId}, {$set: {archived: true}}, {multi: true});
            var user = Meteor.users.findOne({_id: this.userId});
            var notificationMsg = "Project - " + project.name + " - archived by " + user.profile.fullName + " -";
            Meteor.call("sendNotifications", "Project archived", notificationMsg, this.userId);
        } else {
            throw new Meteor.Error('permission-error', 'You can\'t archive this project!');
        }
    },
    archiveProjects: function (projectsIds) {
        for (var i = 0; i < projectsIds.length; i++) {
            Projects.update({_id: projectsIds[i]}, {
                $set: {
                    archived: true,
                    updatedAt: new Date()

                }
            });
            Tasks.update({projectId: projectsIds[i]}, {$set: {archived: true}}, {multi: true});
        }

    },
    restoreProjects: function (projectsIds) {
        for (var i = 0; i < projectsIds.length; i++) {
            Projects.update({_id: projectsIds[i]}, {
                $set: {
                    archived: false,
                    updatedAt: new Date()

                }
            });
            Tasks.update({projectId: projectsIds[i]}, {$set: {archived: false}}, {multi: true});
        }

    },
    restoreProject: function (projectId) {
        if (VZ.canUser('restoreProject', this.userId, projectId)) {
            var project = Projects.findOne({_id: projectId});
            Projects.update(projectId, {
                $set: {
                    archived: false,
                    updatedAt: new Date()

                }
            });
            Tasks.update({projectId: projectId}, {$set: {archived: false}}, {multi: true});
            var user = Meteor.users.findOne({_id: this.userId});
            var notificationMsg = "Project - " + project.name + " - restored by " + user.profile.fullName + " -";
            Meteor.call("sendNotifications", "Project restored", notificationMsg, this.userId);
        } else {
            throw new Meteor.Error('permission-error', 'You can\'t restore this project!');
        }
    },
    // removeProject: function (projectId) {
    //     if (VZ.canUser('removeProject', this.userId, projectId)) {
    //         var project = Projects.findOne({_id: projectId});
    //         Projects.remove(projectId);
    //
    //         var user = Meteor.users.findOne({_id: this.userId});
    //         var notificationMsg = "Project - " + project.name + " - removed by " + user.profile.fullName + " -";
    //         Meteor.call("sendNotifications", "Project removed", notificationMsg, this.userId);
    //     } else {
    //         throw new Meteor.Error('permission-error', 'You can\'t remove this project!');
    //     }
    // },


    assignUsersToProject: function (projectId, assignedUsersWithPositions,
                                    assignedUsersWithPositionsBeforeChanges) {
        var userId = this.userId;
        var user = Meteor.users.findOne({_id: userId});
        var projectToUpdate = Projects.findOne(projectId);
        var userChanges = VZ.Server.UserRoles.searchChanges(assignedUsersWithPositions, assignedUsersWithPositionsBeforeChanges);
        if (!projectToUpdate) {
            throw new Meteor.Error('Company is not exist!');
        }

        if (!VZ.canUser('assignUserToProject', userId, projectId)) {
            throw new Meteor.Error('You\'re not allowed to assign users to this company!');
        }
        var availablePositions = VZ.UserRoles.Projects.userPositions;
        // check whether all changed positions can be updated by current user
        // and update roles after that
        VZ.Server.UserRoles.changeUserRoles(projectId,
            assignedUsersWithPositionsBeforeChanges, assignedUsersWithPositions, availablePositions);

        // If user roles was updated - update company workers list
        var assignedUsersMap = VZ.Server.UserRoles
            .fillAssignedUsersMap(assignedUsersWithPositions, availablePositions);
        assignedUsersMap.updatedAt = new Date();
        Projects.update({_id: projectId}, {$set: assignedUsersMap});

        //----------------------NOTIFICATON SENDING---------------------
        var query = {};
        query["roles." + projectId] = {$in: ["project-manager", "project-admin"]};
        var managersAndAdmins = Meteor.users.find(query).fetch();
        managersAndAdmins = _.map(managersAndAdmins, function (doc) {
            return doc._id;
        });

        //added users
        if (userChanges.addedUsers.length > 0) {
            _.each(userChanges.addedUsers, function (id) {
                var changedUser = Meteor.users.findOne({_id: id});
                var msgForBosses = "Project member - " + changedUser.profile.fullName + " - added to Project " + projectToUpdate.name + " by " + user.profile.fullName + " -";
                var msgForUser = "You have been assigned to Project " + projectToUpdate.name + " by " + user.profile.fullName + " -";
                Meteor.call("sendNotifications", "User assigned to project", msgForBosses, managersAndAdmins);
                Meteor.call("sendNotifications", "Assigned to project", msgForUser, id);
            });
            Meteor.call('addUserChangesMessage', 'users-added', userChanges, user, projectId);
        }

        //removed users
        if (userChanges.removedUsers.length > 0) {
            _.each(userChanges.removedUsers, function (id) {
                var changedUser = Meteor.users.findOne({_id: id});
                var msgForBosses = "Project member - " + changedUser.profile.fullName + " - removed from Project " + projectToUpdate.name + " by " + user.profile.fullName + " -";
                var msgForUser = "You have been removed from Project " + projectToUpdate.name + " by " + user.profile.fullName + " -";

                Meteor.call("sendNotifications", "User removed from project", msgForBosses, managersAndAdmins);
                Meteor.call("sendNotifications", "Removed from project", msgForUser, id);
            });
            Meteor.call('addUserChangesMessage', 'users-removed', userChanges, user.profile.fullName, projectId);

        }

        //changed users
        if (userChanges.changedUsers.length > 0) {
            _.each(userChanges.changedUsers, function (obj) {
                var changedUser = Meteor.users.findOne({_id: obj.id});
                var msgForBosses = "Project member - " + changedUser.profile.fullName + " - from Project " + projectToUpdate.name + " " + obj.privilege + " privilege by " + user.profile.fullName + " - ";
                var msgForUser = "Privilege " + obj.privilege + " in project " + projectToUpdate.name + " by " + user.profile.fullName + " -";

                Meteor.call("sendNotifications", "Changed privilege", msgForBosses, projectToUpdate.ownerId);
                Meteor.call("sendNotifications", "Changed privilege", msgForUser, obj.id)
            });
        }
    },

    deleteProjectFile: function (projectId, fileName) {
        Projects.update(projectId, {$pull: {projectFiles: {fileName: fileName}}});
    },

    addUserToProject: function (userId, projectId) {
        var currentUserId = this.userId;
        if (currentUserId) {
            if (!VZ.canUser('assignUserToProject', this.userId, projectId)) {
                throw new Meteor.Error('permission-error', 'Only project owner can assign users');
            }
            else {
                Projects.update(projectId, {$set: {updatedAt: new Date()}, $addToSet: {assignedUsersIds: userId}});
                Roles.addUsersToRoles(userId, 'project-worker', projectId);
            }
        }
    },
    removeUserFromProject: function (userId, projectId) {
        var currentUserId = this.userId;
        if (currentUserId) {
            if (!VZ.canUser('assignUserToProject', currentUserId, projectId)) {
                throw new Meteor.Error('permission-error', 'Only project owner can remove users');
            }
            else {
                var userTaskAssigned = Tasks.find({projectId: projectId, membersIds: userId}).fetch();
                for (var i = 0; i < userTaskAssigned.length; i++){
                    if(Roles.userIsInRole(userId, ['task-member'], userTaskAssigned[i])){
                        Roles.removeUsersFromRoles(userId, 'task-member', userTaskAssigned[i]);
                    }
                }
                Projects.update(projectId, {$set: {updatedAt: new Date()}, $pull: {assignedUsersIds: userId}});
                Tasks.update({projectId: projectId, membersIds: userId}, {$set: {updatedAt: new Date()}, $pull: {membersIds: userId}}, {multi: true});
                if(Roles.userIsInRole(userId, ['project-worker'], userTaskAssigned[i])) {
                    Roles.removeUsersFromRoles(userId, 'project-worker', userTaskAssigned[i]);
                }
            }
        }
    },
    updateProjectTime: function (projectId) {
        Projects.update(projectId, {$set: {updatedAt: new Date()}});
    }
});