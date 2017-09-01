import { Tasks } from '/imports/api/tasks/tasks';
import { VZ } from '/imports/startup/both/namespace';

Router.map(function () {
    this.route('tasks', {
        path: '/tasks/list',
        layoutTemplate: 'mainLayout',
        template: 'tasksList',
        waitOn: function () {
            return [
                this.subscribe('Tasks'),
                this.subscribe('timeEntries')
            ]
        },
        data: function () {
            return {
                pageTitle: 'Tasks'
            }
        }
    });
    this.route('createTask', {
        path: '/tasks/create',
        layoutTemplate: 'mainLayout',
        template: 'createEditTask',
        waitOn: function () {
            return [
                this.subscribe('Projects')
            ]
        },
        data: function () {
            return {
                pageTitle: 'Create task'
            }
        }
    });
    this.route('editTask', {
        path: '/tasks/edit/:id',
        layoutTemplate: 'mainLayout',
        template: 'createEditTask',
        waitOn: function () {
            return [
                this.subscribe('Tasks', this.params.id),
                this.subscribe('Projects')
            ]
        },
        onBeforeAction: function () {
            var userId = Meteor.userId();
            var taskId = this.params.id;
            if (!VZ.canUser('editTask', userId, taskId)) {
                VZ.notify('You have not permissions to view this page!');
                Router.go('tasks')
            }

            this.next();
        },
        data: function () {
            return {
                task: Tasks.findOne(this.params.id),
                pageTitle: 'Edit task'
            }
        }
    });

    this.route('assignUsersToTask', {
        path: 'tasks/assign-users/:id',
        layoutTemplate: 'mainLayout',
        template: 'assigningUsers',
        waitOn: function () {
            return this.subscribe('Tasks', this.params.id);
        },
        onBeforeAction: function () {
            var userId = Meteor.userId();
            var taskId = this.params.id;
            if (VZ.canUser('assignUserToTask', userId, taskId)) {
                this.next();
            } else {
                VZ.notify('You have not permissions to view this page!');
                Router.go('tasks')
            }
        },
        data: function () {
            var taskId = this.params.id;
            return {
                params: {
                    methodForAssignUsersToEntityName: 'assignWorkerToTask',
                    userPositions: VZ.UserRoles.Tasks.userPositions,

                    backwardRoute: {
                        route: 'tasks'
                    }
                },
                targetEntity: Tasks.findOne({_id: taskId})
            }
        }
    });

    //this.route('assignTeamToTask', {
    //    path: 'tasks/assign-team/:id',
    //    layoutTemplate: 'mainLayout',
    //    template: 'assignTeamToProjectOrCompany',
    //    waitOn: function () {
    //        return this.subscribe('Projects', this.params.id);
    //    },
    //    onBeforeAction: function () {
    //        var userId = Meteor.userId();
    //        var projectId = this.params.id;
    //        if (VZ.canUser('assignTeamToProject', userId, projectId)) {
    //            this.next();
    //        } else {
    //            VZ.notify('You have not permissions to view this page!');
    //            Router.go('projects')
    //        }
    //    },
    //    data: function () {
    //        return {
    //            pageTitle: 'Assign team to the project',
    //            project: Projects.findOne(this.params.id)
    //        }
    //    }
    //});
});
