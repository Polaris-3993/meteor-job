import { Contracts } from '/imports/api/contracts/contracts';

Router.map(function () {
    this.route('contracts', {
        path: '/contracts',
        layoutTemplate: 'mainLayout',
        template: 'contractsList',
        waitOn: function () {
            var query = {};
            var companyId = Session.get('companyId');
            if(companyId){
                query.companyId = companyId;
            }
            return [
                this.subscribe('Contracts', query, {}, true)
            ];
        },
        data: function () {
            return {
                pageTitle: 'Contracts'
            }
        }
    });

    this.route('contract', {
        path: '/contracts/:id/view',
        layoutTemplate: 'mainLayout',
        template: 'contractView',
        waitOn: function () {
            return [
                this.subscribe('Contracts', {_id: this.params.id}, {}, true)
            ];
        },
        data: function () {
            return {
                pageTitle: 'Contracts',
                contract: Contracts.findOne(this.params.id)
            }
        }
    });

    this.route('createContract', {
        path: '/contracts/create',
        layoutTemplate: 'mainLayout',
        template: 'createEditContract',
        data: function () {
            return {
                pageTitle: 'Create contract'
            }
        }
    });

    this.route('editContract', {
        path: '/contracts/:id/edit',
        layoutTemplate: 'mainLayout',
        template: 'createEditContract',
        waitOn: function () {
            return [
                this.subscribe('Contracts', {_id: this.params.id}, {}, true)
            ];
        },
        data: function () {
            return {
                pageTitle: 'Edit contract',
                contract: Contracts.findOne(this.params.id)
            }
        }
    });
});
