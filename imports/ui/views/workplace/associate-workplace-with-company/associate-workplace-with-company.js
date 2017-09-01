import { VZ } from '/imports/startup/both/namespace';
import { Companies } from '/imports/api/companies/companies';
import './associate-workplace-with-company.html';

Template.associateWorkplaceWithCompany.onCreated(function () {
    this.DEFAULT_LIMIT = 10;
    this.limit = new ReactiveVar(this.DEFAULT_LIMIT);
    this.selectedCompanyId = new ReactiveVar(this.data.workplace.associatedCompanyId);

    var self = this;
    this.autorun(function () {
        self.subscribe('Companies', {type: 'all'}, {limit: self.limit.get()});
    });
});

Template.associateWorkplaceWithCompany.onRendered(function () {
});

Template.associateWorkplaceWithCompany.onDestroyed(function () {
});

Template.associateWorkplaceWithCompany.helpers({
    companies: function () {
        var tmpl = Template.instance();
        return Companies.find({_id: {$ne: tmpl.selectedCompanyId.get()}}, {
            limit: tmpl.limit.get()
        });
    },

    selectedCompany: function () {
        return Companies.findOne({_id: Template.instance().selectedCompanyId.get()});
    },

    shouldDisplayLoadMoreButton: function () {
        return Template.instance().limit.get() <= Companies.find().count();
    }
});

Template.associateWorkplaceWithCompany.events({
    'click .companies-for-associate-icon': function (event, tmpl) {
        var selectedCompanyId = event.target.id;
        tmpl.selectedCompanyId.set(selectedCompanyId);
    },

    'click .associate-with-company-button': function (event, tmpl) {
        var selectedCompanyId = tmpl.selectedCompanyId.get()
        
        if(!selectedCompanyId){
            VZ.notify('Select company');
            return
        }
        
        Meteor.call('associateCompanyWithWorkplace', tmpl.data.workplace._id,
            tmpl.selectedCompanyId.get(), function (err) {
                if (err) {
                    VZ.notify('Failed to associate company with workplace')
                    console.log(err);
                } else {
                    VZ.notify('Company associated with workplace');
                    Router.go('workplaces');
                }
            });
    },

    'click .load-more-button': function (event, tmpl) {
        var currentLimit = tmpl.limit.get();
        tmpl.limit.set(currentLimit + tmpl.DEFAULT_LIMIT);
    },

    'click .remove-associated-company': function (event, tmpl) {
        tmpl.selectedCompanyId.set(null);
    },

    'click .cancel-button': function () {
        Router.go('workplaces');
    }
});