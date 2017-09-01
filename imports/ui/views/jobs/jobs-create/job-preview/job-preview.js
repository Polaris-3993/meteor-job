import './job-preview.html';

Template.jobPreview.onCreated(function () {
});

Template.jobPreview.onRendered(function () {
});

Template.jobPreview.helpers({
    desirableEmployeeLocation: function () {
        return this.job.employeeOriginCountry ? this.job.employeeOriginCountry : 'Remote';
    }
});

Template.jobPreview.events({
    'click #delete-button': function (event, tmpl) {
        Meteor.call('archiveJob', tmpl.data.job._id, function (err, res) {
            if (err) {
                console.log(err);
            } else {
                Router.go('userJobs');
            }
        });
    },
    'click #edit-button': function (event, tmpl) {
        Router.go('editJob', {id: tmpl.data.job._id});
    },
    'click #submit-button': function (event, tmpl) {
        Router.go('purchaseJob', {id: tmpl.data.job._id});
    }
});