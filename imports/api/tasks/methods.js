import { Projects } from  '/imports/api/projects/projects';
import { Tasks } from './tasks';
import { VZ } from '/imports/startup/both/namespace';

Meteor.methods({
    'createTask': function (task) {
        // if (task.projectId && !VZ.canUser('assignProjectToTask', this.userId, task.projectId)) {
        //     throw new Meteor.Error('You can\'t assign task to selected project!');
        // }
        // var isEmptyStartDate = moment(task.startDate).startOf('day').toString() == moment('1970-01-01').startOf('day').toString();
        // var isEmptyEndDate = moment(task.dueDate).startOf('day').toString() == moment('1970-01-01').startOf('day').toString();
        //
        // if (isEmptyStartDate) {
        //     task.startDate = '';
        // }
        // if (isEmptyEndDate) {
        //     task.dueDate = '';
        // }
        // if (!isEmptyStartDate && !isEmptyEndDate) {
        //     if (moment(task.startDate) > moment(task.dueDate)) {
        //         throw new Meteor.Error('Due date should be greater than task\'s  start date!');
        //     }
        // }
        if (!task.projectId) {
            throw new Meteor.Error('Project required');
        }
        var projectToAssign = Projects.findOne({_id: task.projectId});
        var currentProjectTasksCount = Tasks.find({projectId: task.projectId}).count() + 1;
        var currentProjectKey = projectToAssign.projectKey;
        var taskKey = currentProjectKey + '-' + currentProjectTasksCount;
        _.extend(task, {
            status: 'Opened',
            archived: false,
            taskKey: taskKey,
            ownerId: this.userId,
            createdAt: new Date(),
            editedAt: new Date(),
            editedBy: this.userId
        });
        var allTasksCount = Tasks.find({projectId: task.projectId}).count();
        var completedTasksCount = Tasks.find({projectId: task.projectId, status: 'Closed', archived: true}).count();

        var taskId = Tasks.insert(task);
        allTasksCount = allTasksCount + 1;
        Projects.update({_id: task.projectId}, {$set: {updatedAt: new Date(), 'info.tasksCount': allTasksCount, 'info.tasksCompleted': completedTasksCount}});

        // Roles.addUsersToRoles(task.ownerId, 'task-owner', taskId);
        // for (var i = 0; i < task.membersIds.length; i++) {
        //     Roles.addUsersToRoles(task.membersIds[i], 'task-member', taskId);
        // }
        return taskId;
    },

    // 'editTask': function (editedTask, selectedProjectId, assignedUsersAfterChanges, assignedUsersBeforeChanges) {
    //     // var isEmptyStartDate = moment(editedTask.startDate).startOf('day').toString() == moment('1970-01-01').startOf('day').toString();
    //     // var isEmptyEndDate = moment(editedTask.dueDate).startOf('day').toString() == moment('1970-01-01').startOf('day').toString();
    //     // if (isEmptyStartDate) {
    //     //     editedTask.startDate = '';
    //     // }
    //     // if (isEmptyEndDate) {
    //     //     editedTask.dueDate = '';
    //     // }
    //
    //     if (!VZ.canUser('editTask', this.userId, editedTask._id) && !VZ.canUser('viewDashboard', this.userId, selectedProjectId)) {// need to be editProject
    //         throw new Meteor.Error('You can\'t edit this task!');
    //     }
    //
    //     // else if (editedTask.projectId
    //     //     && !VZ.canUser('assignProjectToTask', this.userId, editedTask.projectId)) {
    //     //     throw new Meteor.Error('You can\'t assign task to selected project!');
    //     // }
    //     // if (!isEmptyStartDate && !isEmptyEndDate) {
    //     //      if (editedTask.startDate && editedTask.dueDate) {
    //     //         if (moment(editedTask.startDate) > moment(editedTask.dueDate)) {
    //     //             throw new Meteor.Error('Due date should be greater than task\'s  start date!');
    //     //         }
    //     //     }
    //     // }
    //     if (editedTask.status == 'Closed') {
    //         editedTask.archived = true;
    //     }
    //     if (selectedProjectId && editedTask.projectId != selectedProjectId) {
    //         var newProjectToAssign = Projects.findOne({_id: selectedProjectId});
    //         var newProjectTasksCount = Tasks.find({projectId: editedTask.projectId}).count() + 1;
    //         var newProjectKey = newProjectToAssign.projectKey;
    //         var taskKey = newProjectKey + '-' + newProjectTasksCount;
    //         _.extend(editedTask, {
    //             taskKey: taskKey,
    //             projectId: selectedProjectId
    //         });
    //     }
    //     _.extend(editedTask, {
    //         editedAt: new Date(),
    //         editedBy: this.userId
    //     });
    //     var taskId = editedTask._id;
    //     Tasks.update(editedTask._id, {$set: editedTask});
    //     Projects.update({_id: selectedProjectId}, {$set: {updatedAt: new Date()}});
    //     Meteor.call('changeTaskStatus', taskId, editedTask.status);
    // },

    'archiveTask': function (taskId) {
        if (VZ.canUser('archiveTask', this.userId, taskId)) {
            var task = Tasks.findOne({_id: taskId});
            var project = Projects.findOne({_id: task.projectId});

            var openedTasks = Tasks.find({projectId: project._id}).fetch();
            var closedTasks = Tasks.find({projectId: project._id, status: 'Closed', archived: true}).fetch();
            Tasks.update(taskId, {
                $set: {
                    archived: true,
                    status: 'Closed',
                    editedAt: new Date(),
                    editedBy: this.userId
                }
            });


            var openedTasksIds = _.map(openedTasks, function (task) {
                return task._id;
            });
            var closedTasksIds = _.map(closedTasks, function (task) {
                return task._id;
            });
            closedTasksIds.push(taskId);

            Projects.update({_id: task.projectId}, {$set: {updatedAt: new Date(), 'info.tasksCount': openedTasksIds.length, 'info.tasksCompleted': closedTasksIds.length}});

            var user = Meteor.users.findOne({_id: this.userId});
            var notificationMsg = 'Task - ' + task.name + ' - archived by ' + user.profile.fullName + ' -';
            Meteor.call('sendNotifications', 'Task archived', notificationMsg, this.userId);
        } else {
            throw new Meteor.Error('permission-error', 'You can\'t archive this task!');
        }
    },
    archiveTasks: function (taskIds) {
        for (var i = 0; i < taskIds.length; i++) {
            var task = Tasks.findOne({_id: taskIds[i]});
            var project = Projects.findOne({_id: task.projectId});
            var openedTasks = Tasks.find({projectId: project._id}).fetch();
            var closedTasks = Tasks.find({projectId: project._id, status: 'Closed', archived: true}).fetch();

            Tasks.update({_id: taskIds[i]}, {
                $set: {
                    archived: true,
                    status: 'Closed',
                    editedAt: new Date(),
                    editedBy: this.userId
                }
            });


            var openedTasksIds = _.map(openedTasks, function (task) {
                return task._id;
            });
            var closedTasksIds = _.map(closedTasks, function (task) {
                return task._id;
            });
            closedTasksIds.push(task._id);

            Projects.update({_id: task.projectId}, {$set: {updatedAt: new Date(), 'info.tasksCount': openedTasksIds.length, 'info.tasksCompleted': closedTasksIds.length}});

        }
    },
    restoreTasks: function (taskIds) {
        for (var i = 0; i < taskIds.length; i++) {
            var currentTask = Tasks.findOne({_id: taskIds[i]});
            var project = Projects.findOne({_id: currentTask.projectId});
            var openedTasks = Tasks.find({projectId: project._id}).fetch();
            var closedTasks = Tasks.find({projectId: project._id, status: 'Closed', archived: true}).fetch();

            Tasks.update({_id: taskIds[i]}, {
                $set: {
                    archived: false,
                    status: 'Opened',
                    editedAt: new Date(),
                    editedBy: this.userId
                }
            });


            var openedTasksIds = _.map(openedTasks, function (task) {
                return task._id;
            });
            var closedTasksIds = _.map(closedTasks, function (task) {
                return task._id;
            });
            closedTasksIds = _.reject(closedTasksIds, function (id) {
                return id == currentTask._id;
            });

            Projects.update({_id: currentTask.projectId}, {$set: {updatedAt: new Date(), 'info.tasksCount': openedTasksIds.length, 'info.tasksCompleted': closedTasksIds.length}});

        }

    },
    'restoreTask': function (taskId) {
        if (VZ.canUser('restoreTask', this.userId, taskId)) {
            var task = Tasks.findOne({_id: taskId});
            var project = Projects.findOne({_id: task.projectId});
            var openedTasks = Tasks.find({projectId: project._id}).fetch();
            var closedTasks = Tasks.find({projectId: project._id, status: 'Closed', archived: true}).fetch();

            Tasks.update(taskId, {
                $set: {
                    archived: false,
                    status: 'Opened',
                    editedAt: new Date(),
                    editedBy: this.userId
                }
            });


            var openedTasksIds = _.map(openedTasks, function (task) {
                return task._id;
            });
            var closedTasksIds = _.map(closedTasks, function (task) {
                return task._id;
            });
            closedTasksIds = _.reject(closedTasksIds, function (id) {
                return id == taskId;
            });

            Projects.update({_id: task.projectId}, {$set: {updatedAt: new Date(), 'info.tasksCount': openedTasksIds.length, 'info.tasksCompleted': closedTasksIds.length}});


            var user = Meteor.users.findOne({_id: this.userId});
            var notificationMsg = 'Task - ' + task.name + ' - restored by ' + user.profile.fullName + ' -';
            Meteor.call('sendNotifications', 'Task restored', notificationMsg, this.userId);
        } else {
            throw new Meteor.Error('permission-error', 'You can\'t restore this task!');
        }
    },

    'deleteTask': function () {
    },

    'assignWorkerToTask': function (taskId, assignedUsersWithPositions,
                                    assignedUsersWithPositionsBeforeChanges) {

        var userId = this.userId;
        var taskToUpdate = Tasks.findOne(taskId);

        if (!taskToUpdate) {
            throw new Meteor.Error('Task not exist!');
        }

        if (!VZ.canUser('assignUserToTask', userId, taskId) && !VZ.canUser('viewDashboard', userId, taskToUpdate.projectId)) {// need to be editProject
            throw new Meteor.Error('You\'re not allowed to assign users to this task!');
        }

        var availablePositions = VZ.UserRoles.Tasks.userPositions;

        // check whether all changed positions can be updated by current user
        // and update roles after that
        VZ.Server.UserRoles.changeUserRoles(taskId,
            assignedUsersWithPositionsBeforeChanges, assignedUsersWithPositions, availablePositions);

        // If user roles was updated - update company workers list
        var assignedUsersMap = VZ.Server.UserRoles
            .fillAssignedUsersMap(assignedUsersWithPositions, availablePositions);
        Tasks.update({_id: taskId}, {$set: assignedUsersMap});
    },

    'assignTeamToTask': function () {
    },
    deleteTaskFile: function (taskId, fileName) {
        Tasks.update(taskId, {
            $set: {
                editedAt: new Date(),
                editedBy: this.userId
            }, $pull: {taskFiles: {fileName: fileName}}
        });
    },
    addUserToTask: function (userId, taskId, projectId) {
        var currentUserId = this.userId;
        if (currentUserId) {
            if (!VZ.canUser('addUserToTask', currentUserId, projectId)) {
                throw new Meteor.Error('permission-error', 'You can\'t assign user\'s to task!');
            }
            else if (!VZ.canUser('addUserToTask', userId, projectId)) {
                throw new Meteor.Error('permission-error', 'User can\'t be assigned to task');
            }
            else if (Roles.userIsInRole(userId, 'task-member', taskId)) {
                throw new Meteor.Error('permission-error', 'User is already a task member');
            }
            else {
                Tasks.update(taskId, {
                    $set: {
                        editedAt: new Date(),
                        editedBy: currentUserId
                    }, $addToSet: {membersIds: userId}
                });
                Roles.addUsersToRoles(userId, 'task-member', taskId);
            }
        }
    },
    removeUserFromTask: function (userId, taskId, projectId) {
        var currentUserId = this.userId;
        if (currentUserId) {
            if (!VZ.canUser('addUserToTask', this.userId, projectId)) {
                throw new Meteor.Error('permission-error', 'You can\'t remove user\'s from task!');
            }
            else {
                Tasks.update(taskId, {
                    $set: {
                        editedAt: new Date(),
                        editedBy: currentUserId
                    }, $pull: {membersIds: userId}
                });
                Roles.removeUsersFromRoles(userId, 'task-member', taskId);
            }
        }
    },
    updateTask: function (taskId) {
        Tasks.update(taskId, {$set: {editedAt: new Date(), editedBy: this.userId}});
    },
    changeTaskStatus: function (taskId, status) {
        var userId = this.userId;
        var query = {editedAt: new Date(), status: status, editedBy: this.userId};
        var task = Tasks.findOne({_id: taskId});
        var project = Projects.findOne({_id: task.projectId});
        var openedTasks = Tasks.find({projectId: project._id}).fetch();
        var closedTasks = Tasks.find({projectId: project._id, status: 'Closed', archived: true}).fetch();

        if (status == 'In-review') {
            query.sendToInReview = userId;
        }

        if(status == 'Closed'){
            query.archived= true;
            Tasks.update(taskId, {$set: query});

            var openedTasksIds = _.map(openedTasks, function (task) {
                return task._id;
            });
            var closedTasksIds = _.map(closedTasks, function (task) {
                return task._id;
            });
            closedTasksIds.push(taskId);

            Projects.update({_id: task.projectId}, {$set: {updatedAt: new Date(), 'info.tasksCount': openedTasksIds.length, 'info.tasksCompleted': closedTasksIds.length}});

        }
        if(status == 'Opened'){
            query.archived= false;

            Tasks.update(taskId, {$set: query});

            var openedTasksIdsP = _.map(openedTasks, function (task) {
                return task._id;
            });
            var closedTasksIdsP = _.map(closedTasks, function (task) {
                return task._id;
            });
            closedTasksIdsP = _.reject(closedTasksIdsP, function (id) {
                return id == taskId;
            });

            Projects.update({_id: task.projectId}, {$set: {updatedAt: new Date(), 'info.tasksCount': openedTasksIdsP.length, 'info.tasksCompleted': closedTasksIdsP.length}});
        }
        Tasks.update(taskId, {$set: query});
    },
    addYoutubeVideo: function (url, taskId) {
        if ((/http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/g).test(url)) {
            var youTubeVideo = {mediaLink: url, uploaded: new Date(), type: 'video'};
            if(taskId != 'new-task'){
                Tasks.update(taskId, {
                    $set: {
                        editedAt: new Date(),
                        editedBy: this.userId
                    }, $push: {taskFiles: youTubeVideo}
                });
            }
            else {
                return youTubeVideo;
            }
        }
        else {
            throw new Meteor.Error('Enter a valid YouTube url');
        }
    }
});