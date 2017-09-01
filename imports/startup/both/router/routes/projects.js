import { Projects } from '/imports/api/projects/projects';
import { VZ } from '/imports/startup/both/namespace';
Router.map(function () {
    this.route('projects', {
        path: '/projects',
        layoutTemplate: 'mainLayout',
        template: 'projectsListNew',
        data: function () {
            return {
                pageTitle: 'Projects'
            }
        }
    });

    this.route('project', {
        path: '/project/:id',
        layoutTemplate: 'mainLayout',
        template: 'projectView',
        waitOn: function () {
            return [
                this.subscribe('Projects', this.params.id)
            ];
        },
        data: function () {
            return {
                pageTitle: 'Projects',
                project: Projects.findOne(this.params.id)
            }
        }
    });

    this.route('projectDashboard', {
        path: '/project/:id/dashboard/:tab?',
        layoutTemplate: 'mainLayout',
        onBeforeAction: function () {
            var tab = this.params.tab;
            var id = this.params.id;
            var tasks = this.params.query.tasks;
            if(!VZ.canUser('viewDashboard', Meteor.userId(), id)){
                Router.go('projects');
            }
            if (tab && tab !== 'tasks') {
                Router.go('projectDashboard', {id: id, tab: tab});
                this.next();
            }
            if (tab && tab == 'tasks' && tasks) {
                this.next();
            }
            if (tab && tab == 'tasks' && !tasks) {
                Router.go('projectDashboard', {id: id, tab:'tasks'}, {query: {'tasks': 'all'}});
                this.next();
            }
            if(!tab || !tab && !tasks){
                Router.go('projectDashboard', {id: id, tab:'tasks'}, {query: {'tasks': 'all'}});
                this.next();
            }
        },
        action: function () {
            this.render('projectDashboard');
        },
        waitOn: function () {
            return [
                this.subscribe('projectInfo', this.params.id)
            ];
        },
        data: function () {
            var tasks =  Router.current().params.query && Router.current().params.query.tasks;
            var data = {
                pageTitle: '',
                tab: Router.current().params.tab,
                project: Projects.findOne(this.params.id)
            };
            if(tasks){
                data.tasks = tasks;
            }
            return data;
        }
    });
    /////////////////////////////////////////
    this.route('viewProjectTimeEntries', {
        path: '/projects/time-entries/:id/:selectedUsersIds?',
        layoutTemplate: 'mainLayout',
        template: 'projectViewTimeEntries',
        waitOn: function () {
            return [
                this.subscribe('Projects', this.params.id)
            ];
        },
        onBeforeAction: function () {
            if (VZ.canUser('viewProject', Meteor.userId(), this.params.id)) {
                this.next();
            } else {
                Router.go('projects');
                VZ.notify('You have not permissions to view this page!');
            }
        },
        data: function () {
            var selectedUsersIds = this.params.selectedUsersIds;
            selectedUsersIds = selectedUsersIds ? selectedUsersIds.split(',') : [];

            return {
                pageTitle: 'View project\'s time entries',
                project: Projects.findOne({_id: this.params.id}),
                selectedUsersIds: selectedUsersIds
            }
        }
    });

    this.route('createProject', {
        path: '/projects/create',
        layoutTemplate: 'mainLayout',
        template: 'createEditProject',
        data: function () {
            return {
                pageTitle: 'Create project'
            }
        }
    });

    this.route('editProject', {
        path: '/projects/edit/:id',
        layoutTemplate: 'mainLayout',
        template: 'createEditProject',
        waitOn: function () {
            return [
                this.subscribe('Projects', this.params.id)
            ];
        },
        onBeforeAction: function () {
            if (VZ.canUser('editProject', Meteor.userId(), this.params.id)) {
                this.next();
            } else {
                Router.go('projects');
                VZ.notify('You have not permissions to view this page!');
            }
        },
        data: function () {
            return {
                project: Projects.findOne({_id: this.params.id}),
                pageTitle: 'Edit project'
            }
        }
    });

    this.route('assignUsersToProject', {
        path: 'projects/assign-users/:id',
        layoutTemplate: 'mainLayout',
        template: 'assigningUsers',
        waitOn: function () {
            return this.subscribe('Projects', this.params.id);
        },
        onBeforeAction: function () {
            var userId = Meteor.userId();
            var projectId = this.params.id;
            if (VZ.canUser('assignUserToProject', userId, projectId)) {
                this.next();
            } else {
                VZ.notify('You have not permissions to view this page!');
                Router.go('projects')
            }
        },
        data: function () {
            var projectId = this.params.id;
            return {
                params: {
                    methodForAssignUsersToEntityName: 'assignUsersToProject',
                    userPositions: VZ.UserRoles.Projects.userPositions,

                    backwardRoute: {
                        route: 'projects'
                    }
                },
                targetEntity: Projects.findOne({_id: projectId})
            }
        }
    });

    this.route('assignTeamToProject', {
        path: 'projects/assign-team/:id',
        layoutTemplate: 'mainLayout',
        template: 'assignTeamToProjectOrCompany',
        waitOn: function () {
            return this.subscribe('Projects', this.params.id);
        },
        onBeforeAction: function () {
            var userId = Meteor.userId();
            var projectId = this.params.id;
            if (VZ.canUser('assignTeamToProject', userId, projectId)) {
                this.next();
            } else {
                VZ.notify('You have not permissions to view this page!');
                Router.go('projects')
            }
        },
        data: function () {
            return {
                pageTitle: 'Assign team to the project',
                project: Projects.findOne(this.params.id)
            }
        }
    });
});
