import { VZ } from '/imports/startup/both/namespace';
import { UserEducation } from '/imports/api/userEducations/userEducations';
import './education-card.html';

Template.educationCard.onCreated(function () {
    var self = this;
    this.educationLimit = new ReactiveVar(2);
    this.autorun(function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (user && user.profile && user.profile.educationIds) {
            self.subscribe('userEducation', user.profile.educationIds, self.educationLimit.get());
        }
    });
});
Template.educationCard.onDestroyed(function () {
        // $('body').off('resize');
});
Template.educationCard.helpers({
    profileOwner: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        return user && Meteor.userId() == user._id;
    },
    userEducation: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (user.profile.educationIds) {
            var educationIds = user.profile.educationIds;
            return UserEducation.find({_id: {$in: educationIds}}, {
                sort: {
                    completeAt: -1
                },
                limit: Template.instance().educationLimit.get()
            });
        }
    },
    showLessEducation: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (user.profile.educationIds) {
            return Template.instance().educationLimit.get() == user.profile.educationIds.length && Template.instance().educationLimit.get() > 2;
        }

    },
    showMoreEducation: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }

        if (user.profile.educationIds) {
                return Template.instance().educationLimit.get() < user.profile.educationIds.length;
        }
    }
});
Template.educationCard.events({
    'click .add-education': function (event, tmpl) {
        event.preventDefault();
        var parentNode = $('body')[0],
            onEducationInsertEdit = function (education, educationTmpl) {
                Meteor.call('addEducation', education, function (error, result) {
                    if (!error) {
                        educationTmpl.$('#edit-education-modal').modal('close');
                        removeTemplate(educationTmpl.view);
                        VZ.notify('Success');
                    }
                    else {
                        VZ.notify(error.message.replace(/[[0-9]+]/gi, ''));

                    }
                });
            },
            modalData = {
                onEducationInsertEdit: onEducationInsertEdit
            };
        Blaze.renderWithData(Template.editEducationModal, modalData, parentNode);
    },
    'click .load-more': function (event, tmpl) {
        event.preventDefault();
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        var limit = user.profile.educationIds.length || 2;
        tmpl.educationLimit.set(limit);
    },
    'click .show-less': function (event, tmpl) {
        event.preventDefault();
        tmpl.educationLimit.set(2);
    }

});
var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};