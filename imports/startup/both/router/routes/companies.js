import { Companies } from '/imports/api/companies/companies';
import { VZ } from '/imports/startup/both/namespace';

Router.map(function () {
    // for this route exist dynamic subscription in Template.companiesPage.onCreated
    this.route('companies', {
        path: '/companies/:type?',
        layoutTemplate: 'mainLayout',
        template: 'companiesList',
        onBeforeAction: function () {
            if (this.params.type) {
                this.next();
            } else {
                Router.go('companies', {type: 'all'});
            }
        },
        waitOn: function () {
            var type = this.params.type || 'all';
            return [
                this.subscribe('Companies')

                // this.subscribe('Companies', {type: type})
            ]
        },
        data: function () {
            return {
                pageTitle: 'Companies',
                type: this.params.type,
                companies: Companies.find({isArchived: false}),
                archivedCompanies: Companies.find({isArchived: true})
            }
        }
    });

    this.route('addCompany', {
        path: '/company/add',
        layoutTemplate: 'mainLayout',
        template: 'createEditCompany',
        waitOn: function () {
          return [this.subscribe('allCountries')];
        },
        data: function () {
            return {
                pageTitle: 'New company'
            }
        }
    });

    this.route('editCompany', {
        path: '/company/edit/:id',
        layoutTemplate: 'mainLayout',
        template: 'createEditCompany',
        waitOn: function () {
            return [this.subscribe('Companies', {_id: this.params.id}),
                     this.subscribe('allCountries')];
        },
        onBeforeAction: function () {
            if (VZ.canUser('editCompany', Meteor.userId(), this.params.id)) {
                this.next();
            } else {
                Router.go('companies', {type: 'all'});
                VZ.notify('You have not permissions to view this page!');
            }
        },
        data: function () {
            return {
                pageTitle: 'Edit company',
                company: Companies.findOne(this.params.id)
            }
        }
    });

    this.route('companyDetail', {
        path: 'company/:id',
        layoutTemplate: 'mainLayout',
        template: 'companyDetail',
        waitOn: function () {
            return [
                this.subscribe('Companies', {_id: this.params.id}),
                this.subscribe('CompanyWorkplaces', this.params.id)
                ];
        },
        onBeforeAction: function () {
            if (VZ.canUser('viewCompany', Meteor.userId(), this.params.id)) {
                this.next();
            } else {
                Router.go('companies', {type: 'all'});
                VZ.notify('You have not permissions to view this page!');
            }
        },
        data: function () {
            return {
                pageTitle: 'Company details',
                company: Companies.findOne(this.params.id)
            }
        }
    });

    this.route('companyVerifying', {
        path: '/company-verifying',
        layoutTemplate: 'mainLayout',
        template: 'companyVerifying',
        waitOn: function () {
            return this.subscribe('companiesForVerifying')
        },
        onBeforeAction: function () {
            if (!VZ.canUser('verifyCompany', Meteor.userId(), this.params.id)) {
                Router.go('companies')
            }
            this.next();
        }
    });

    this.route('assignUsersToCompany', {
        path: 'company/assign-users/:id',
        layoutTemplate: 'mainLayout',
        template: 'assigningUsers',
        waitOn: function () {
            return this.subscribe('Companies', {_id: this.params.id});
        },
        onBeforeAction: function () {
            if (!VZ.canUser('assignUserToCompany', Meteor.userId(), this.params.id)) {
                VZ.notify('You have not permissions to view this page!');
                Router.go('companies')
            }

            this.next();
        },
        data: function () {
            var companyId = this.params.id;
            return {
                params: {
                    methodForAssignUsersToEntityName: 'assignUsersToCompany',
                    userPositions: VZ.UserRoles.Company.userPositions,

                    backwardRoute: {
                        route: 'companyDetail',
                        params: {
                            id: companyId
                        }
                    }
                },
                targetEntity: Companies.findOne({_id: this.params.id})
            }
        }
    });

    this.route('assignTeamToCompany', {
        path: 'companies/assign-team/:id',
        layoutTemplate: 'mainLayout',
        template: 'assignTeamToProjectOrCompany',
        waitOn: function () {
            return this.subscribe('Companies', {_id: this.params.id});
        },
        onBeforeAction: function () {
            if (!VZ.canUser('assignTeamToCompany', Meteor.userId(), this.params.id)) {
                VZ.notify('You have not permissions to view this page!');
                Router.go('companies')
            }

            this.next();
        },
        data: function () {
            return {
                pageTitle: 'Assign team to the company',
                company: Companies.findOne(this.params.id)
            }
        }
    });
});