import { VZ } from '/imports/startup/both/namespace';
import './experience-card.html';

import { UserWorkExperience } from '/imports/api/userWorkExperience/userWorkExperience';

Template.experienceCard.onCreated(function () {
    var self = this;
    this.jobsLimit = new ReactiveVar(2);
    this.autorun(function () {
        // Template.currentData();
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (user && user.profile && user.profile.workExperienceIds) {
            self.subscribe('userWorkExperience', user.profile.workExperienceIds, self.jobsLimit.get());
        }
    });
});
Template.experienceCard.onRendered(function () {

});
Template.experienceCard.onDestroyed(function () {
        // $('body').off('resize');
});
Template.experienceCard.helpers({
    profileOwner: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        return user && Meteor.userId() == user._id;
    },
    userWorkExperience: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (user.profile.workExperienceIds) {
            var workExperience = user.profile.workExperienceIds;
            return UserWorkExperience.find({_id: {$in: workExperience}}, {
                sort: {
                    startAt: -1
                },
                limit: Template.instance().jobsLimit.get()
            });
        }
    },
    showLess: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (user.profile.workExperienceIds) {
            return Template.instance().jobsLimit.get() == user.profile.workExperienceIds.length && Template.instance().jobsLimit.get() > 2;
        }

    },
    showMore: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }

        if (user.profile.workExperienceIds) {
                return Template.instance().jobsLimit.get() < user.profile.workExperienceIds.length;
        }
    }
});
Template.experienceCard.events({
    'click .add-job-icon': function (event, tmpl) {
        event.preventDefault();
        var parentNode = $('body')[0],
            onJobInsertEdit = function (job, experienceTmpl) {
                Meteor.call('addWorkExperience', job, function (error, result) {
                    if (!error) {
                        experienceTmpl.$('#edit-experience-modal').modal('close');
                        removeTemplate(experienceTmpl.view);
                        VZ.notify('Success');
                    }
                    else {
                        VZ.notify(error.message.replace(/[[0-9]+]/gi, ''));
                    }
                });
            },
            modalData = {
                onJobInsertEdit: onJobInsertEdit
            };
        Blaze.renderWithData(Template.editExperienceModal, modalData, parentNode);
    },
    'click .load-more': function (event, tmpl) {
        event.preventDefault();
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        var jobsToShow = user.profile.workExperienceIds.length || 2;
        tmpl.jobsLimit.set(jobsToShow);
    },
    'click .show-less': function (event, tmpl) {
        event.preventDefault();
        tmpl.jobsLimit.set(2);
    }

});
var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};