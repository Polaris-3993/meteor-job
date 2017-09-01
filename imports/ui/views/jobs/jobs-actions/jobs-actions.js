import { VZ } from '/imports/startup/both/namespace';
import './jobs-actions.html';

Template.jobsActions.onRendered(function () {
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

Template.jobsActions.helpers({
});

Template.jobsActions.events({
    'click .archive-job-button': function (event, tmpl) {
        event.preventDefault();
        var jobId= this.data._id;
        Meteor.call('archiveJob', jobId, function (error, result) {
            if (!error) {
                VZ.notify('Archived');
            }
        });
    },
    'click .restore-job-button': function (event, tmpl) {
        event.preventDefault();
        var jobId= this.data._id;
        Meteor.call('restoreJob', jobId, function (error, result) {
            if (!error) {
                VZ.notify('Restored');
            }
        });
    }
});