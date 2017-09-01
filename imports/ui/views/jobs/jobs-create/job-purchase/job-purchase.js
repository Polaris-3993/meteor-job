import './job-purchase.html';

Template.jobPurchase.onCreated(function () {
});

Template.jobPurchase.onRendered(function () {
});

Template.jobPurchase.helpers({});

Template.jobPurchase.events({
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
        Router.go('userJobs')
    }
});