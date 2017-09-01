import { Teams } from '/imports/api/teams/teams';
import { VZ } from '/imports/startup/both/namespace';

Router.map(function () {
    this.route('teams', {
        path: '/teams/list/:visibility?',
        layoutTemplate: 'mainLayout',
        template: 'teamsList',
        waitOn: function () {
            var visibility = this.params.visibility || 'all';
            var query = {visibility: visibility};
            var companyId = Session.get('companyId');
            if(companyId){
                query.assignedCompanyId = companyId;
            }
            return [
                this.subscribe('Teams', query)
            ]
        },
        data: function () {
            return {
                visibility: this.params.visibility,
                pageTitle: 'Teams'
            }
        }
    });
    this.route('createTeam', {
        path: '/teams/create',
        layoutTemplate: 'mainLayout',
        template: 'createEditTeam',
        data: function () {
            return {
                pageTitle: 'Create team'
            }
        }
    });
    this.route('editTeam', {
        path: '/teams/edit/:id',
        layoutTemplate: 'mainLayout',
        template: 'createEditTeam',
        waitOn: function () {
            return [
                this.subscribe('Teams', {_id: this.params.id})
            ]
        },
        onBeforeAction: function () {
            var userId = Meteor.userId();
            var teamId = this.params.id;
            if (!VZ.canUser('editTeam', userId, teamId)) {
                VZ.notify('You have not permissions to view this page!');
                Router.go('teams')
            }

            this.next();
        },
        data: function () {
            return {
                team: Teams.findOne(this.params.id),
                pageTitle: 'Edit team'
            }
        }
    });

    this.route('assignMembersToTeam', {
        path: 'team/assign-members/:id',
        layoutTemplate: 'mainLayout',
        template: 'assigningUsers',
        waitOn: function () {
            return this.subscribe('Teams', {_id: this.params.id});
        },
        onBeforeAction: function () {
            var userId = Meteor.userId();
            var teamId = this.params.id;
            if (!VZ.canUser('assignUserToTeam', userId, teamId)) {
                VZ.notify('You have not permissions to view this page!');
                Router.go('teams')
            }

            this.next();
        },
        data: function () {
            return {
                params: {
                    methodForAssignUsersToEntityName: 'assignMembersToTeam',
                    userPositions: VZ.UserRoles.Teams.userPositions,

                    backwardRoute: {
                        route: 'teams'
                    }
                },
                targetEntity: Teams.findOne({_id: this.params.id})
            }
        }
    });
});
