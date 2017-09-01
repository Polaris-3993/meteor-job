import { Workplaces } from '/imports/api/workPlaces/workPlaces';
import { VZ } from '/imports/startup/both/namespace';

Router.map(function () {
    this.route('workplaces', {
        path: '/workplaces',
        layoutTemplate: 'mainLayout',
        template: 'workplacesList',
        waitOn: function () {
            return [
                Meteor.subscribe('Workplaces'),
                Meteor.subscribe('Tools')
            ]
        },
        data: function () {
            return {
                pageTitle: 'Workplaces'
            }
        }
    });

    this.route('workplace', {
        path: '/workplace/:id',
        layoutTemplate: 'mainLayout',
        template: 'workplace',
        waitOn: function () {
            return [
                Meteor.subscribe('Workplaces', this.params.id),
                Meteor.subscribe('Tools')
            ]
        }
    });

    this.route('createWorkplace', {
        path: '/workplaces/create-workplace',
        layoutTemplate: 'mainLayout',
        template: 'createEditWorkplace',
        waitOn: function () {
            return [
                Meteor.subscribe('Tools')
            ]
        },
        data: function () {
            return {
                pageTitle: 'Create workplace'
            }
        }
    });

    this.route('editWorkplace', {
        path: '/workplaces/edit-workplace/:id',
        layoutTemplate: 'mainLayout',
        template: 'createEditWorkplace',
        waitOn: function () {
            return [
                Meteor.subscribe('Tools'),
                Meteor.subscribe('Workplaces', this.params.id)
            ]
        },
        onBeforeAction: function () {
            if (VZ.canUser('editWorkplace', Meteor.user(), this.params.id)) {
                this.next();
            } else {
                VZ.notify('You can\'t edit this workplace!');
                Router.go('workplaces');
            }

        },
        data: function () {
            return {
                pageTitle: 'Edit workplace',
                workplace: Workplaces.findOne(this.params.id)
            }
        }
    });

    this.route('assignUsersToWorkplace', {
        path: 'workplaces/assign-users/:id',
        layoutTemplate: 'mainLayout',
        template: 'assigningUsers',
        waitOn: function () {
            return this.subscribe('Workplaces', this.params.id);
        },
        onBeforeAction: function () {
            if (VZ.canUser('assignUserToWorkplace', Meteor.user(), this.params.id)) {
                this.next();
            } else {
                VZ.notify('You have not permissions to view this page!');
                Router.go('workplaces')
            }
        },
        data: function () {
            var workplaceId = this.params.id;
            return {
                params: {
                    methodForAssignUsersToEntityName: 'assignUsersToWorkplace',
                    userPositions: VZ.UserRoles.Workplaces.userPositions,

                    backwardRoute: {
                        route: 'workplace',
                        params: {
                            id: workplaceId
                        }
                    }
                },
                targetEntity: Workplaces.findOne({_id: workplaceId})
            }
        }
    });

    this.route('associateWorkplaceWithCompany', {
        path: 'workplaces/associate-with-company/:id',
        layoutTemplate: 'mainLayout',
        template: 'associateWorkplaceWithCompany',
        waitOn: function () {
            return [
                Meteor.subscribe('Workplaces', this.params.id)
            ]
        },
        onBeforeAction: function () {
            if (VZ.canUser('associateWorkplaceWithCompany', Meteor.user(), this.params.id)) {
                this.next();
            } else {
                VZ.notify('You can\'t edit this workplace!');
                Router.go('workplaces');
            }

        },
        data: function () {
            return {
                pageTitle: 'Associate company with workplace',
                workplace: Workplaces.findOne(this.params.id)
            }
        }

    });
});


var isCanViewWorkplace = function () {
    var workplace = Workplaces.findOne(this.params.id);
    if (!!workplace) {
        this.next();
    } else {
        Router.go('workplaces');
    }
};

Router.onBeforeAction(isCanViewWorkplace, {
    only: ['workplace', 'editWorkplace']
});
