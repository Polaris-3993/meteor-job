import { VZ } from '/imports/startup/both/namespace';
import './company-actions.html';

Template.companyActions.onRendered(function () {
    this.$('.dropdown-button').dropdown({
        inDuration: 100,
        outDuration: 125,
        constrain_width: false, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on hover
        gutter: 0, // Spacing from edge
        // belowOrigin: false, // Displays dropdown below the button
        alignment: 'right' // Displays dropdown with edge aligned to the left of button
    });
});

Template.companyActions.helpers({
    canEditCompany: function () {
        return VZ.canUser('editCompany', Meteor.userId(), this.data._id);
    }
});

Template.companyActions.events({
    'click #archive-company': function (event, tmpl) {
        event.preventDefault();
        var companyId= this.data._id;
        Session.set('companiesFormChanged',  false);
        Meteor.call('archiveCompany', companyId, function (error, result) {
            if(!error){
                VZ.notify('Archived');
                Session.set('companiesFormChanged',  true);
            }
            else {
                VZ.notify(error.message);
                Session.set('companiesFormChanged',  true);
            }
        });
    },
    'click #restore-company': function (event, tmpl) {
        event.preventDefault();
        var companyId= this.data._id;
        Session.set('companiesFormChanged',  false);
        Meteor.call('restoreCompany', companyId, function (error, result) {
            if(!error){
                VZ.notify('Restored');
                Session.set('companiesFormChanged',  true);
            }
            else {
                VZ.notify(error.message);
                Session.set('companiesFormChanged',  true);
            }
        });
    }
});