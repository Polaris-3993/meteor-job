import { VZ } from '/imports/startup/both/namespace';
import './experience-item.html';

import { UserWorkExperience } from '/imports/api/userWorkExperience/userWorkExperience';

Template.experienceItem.onCreated(function () {
    this.showMore = new ReactiveVar(false);
});
Template.experienceItem.onDestroyed(function () {
});
Template.experienceItem.onRendered(function () {

});
Template.experienceItem.helpers({
    profileOwner: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        return user && Meteor.userId() == user._id;
    },
    workingPeriod: function(){
        if(this.data.isWorking){
            return moment(this.data.startAt).format('YYYY') + ' - present';
        }
        else{
            return moment(this.data.startAt).format('YYYY') + ' - ' + moment(this.data.completeAt).format('YYYY');
        }
    },
    description: function () {
            var biography = this.data.description;
            var new_text, small_len = 200;

            if (this.data.description.length > 200 && !Template.instance().showMore.get()) {
                new_text = biography.substr(0, (small_len - 3)) + '...';
                return new_text;
            }
            return this.data.description;
    },
    showMore: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        return this.data.description.length > 200 && Template.instance().showMore.get();
    },
    showMoreButton: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        return this.data.description.length > 200;
    },
});
Template.experienceItem.events({
    'click .edit-job': function (event, tmpl) {
        event.preventDefault();
        var jobId = this.data._id;
        var jobProject = UserWorkExperience.findOne({_id: jobId});
        var parentNode = $('body')[0],
            onJobInsertEdit = function (job, experienceTmpl) {
                Meteor.call('updateWorkExperience', jobId, job, function (error, result) {
                    if (!error) {
                        experienceTmpl.$('#edit-portfolio-modal').modal('close');
                        removeTemplate(experienceTmpl.view);
                        VZ.notify('Success');
                    }
                    else {
                        VZ.notify(error.message.replace(/[[0-9]+]/gi, ''));
                    }
                });
            },
            modalData = {
                jobProject: jobProject,
                onJobInsertEdit: onJobInsertEdit
            };
        Blaze.renderWithData(Template.editExperienceModal, modalData, parentNode);
    },
    'click .remove-job': function (event, tmpl) {
        event.preventDefault();
        var jobId = this.data._id;
        Meteor.call('removeWorkExperience', jobId, function (error, result) {
            if(error){
                VZ.notify(error.message.replace(/[[0-9]+]/gi, ''));

            }
        });
    },
    'click .show-more-description': function (event, tmpl) {
        event.preventDefault();
        tmpl.showMore.set(true);
    },
    'click .show-less-description': function (event, tmpl) {
        event.preventDefault();
        tmpl.showMore.set(false);
    }
});
var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};