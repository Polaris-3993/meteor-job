import { VZ } from '/imports/startup/both/namespace';
import './edit-experience-modal.html';

Template.editExperienceModal.onCreated(function () {
    var isWorking = this.data.jobProject ? this.data.jobProject.isWorking : false;
    this.isWorking = new ReactiveVar(isWorking);
});

Template.editExperienceModal.onRendered(function () {
    var self = this;
    this.$('.modal').modal();
    this.$('.modal').modal('open');
    $('.datepicker').pickadate({
        selectMonths: true,
        selectYears: 15
    });
    this.$('textarea#job-description').characterCounter();
    this.$('#job-description').trigger('autoresize');
    $('.lean-overlay').on('click', function () {
        removeTemplate(self.view);
    });
    document.addEventListener('keyup', function (e) {
        if (e.keyCode == 27) {
            removeTemplate(self.view);
        }
    });
    var startDate = this.$('#start-date').pickadate('picker');
    var completeDate = this.$('#complete-date').pickadate('picker');


    if (this.data.jobProject) {
        startDate.set('select', this.data.jobProject.startAt);
        if(!this.data.jobProject.isWorking){
        completeDate.set('select', this.data.jobProject.completeAt);
        }
    }

});
Template.editExperienceModal.onDestroyed(function () {
    $('.lean-overlay').remove();
});
Template.editExperienceModal.helpers({
    currentlyWorking: function () {
        return Template.instance().isWorking.get();
    }
});

Template.editExperienceModal.events({
    'change #filled-in-box': function (event, tmpl) {
        event.preventDefault();
        var isWorking = event.target.checked;
        tmpl.isWorking.set(isWorking);
    },
    'click .save': function (event, tmpl) {
        event.preventDefault();
        var company = tmpl.$('#company').val().trim();
        var title = tmpl.$('#title').val().trim();
        var description = tmpl.$('#job-description').val().trim();
        var isWorking = tmpl.isWorking.get();
        var startDatePicker = tmpl.$('#start-date').pickadate('picker');
        var startDate = new Date(startDatePicker.get());
        var completeDatePicker = tmpl.$('#complete-date').pickadate('picker');
        var comleteDate = new Date(completeDatePicker.get());

        var job = {
            title: title,
            company: company,
            description: description,
            startAt: startDate,
            isWorking: isWorking
        };

        var isValidStart = moment(startDate).isValid();
        var isValidComplete = moment(comleteDate).isValid();
        if (!isWorking && isValidComplete) {
            job.completeAt = comleteDate;
        }
        else if (!isWorking && !isValidComplete) {
            VZ.notify('Select complete date');
            return;
        }
        else if(!isValidStart){
            VZ.notify('Select start date');
            return;
        }
        tmpl.data.onJobInsertEdit(job, tmpl);
    },
    'click .cancel': function (event, tmpl) {
        event.preventDefault();
        tmpl.$('#edit-experience-modal').modal('close');
        removeTemplate(tmpl.view);
    },
    'click .add-more': function (event, tmpl) {
        event.preventDefault();
        var company = tmpl.$('#company').val().trim();
        var title = tmpl.$('#title').val().trim();
        var description = tmpl.$('#job-description').val().trim();
        var isWorking = tmpl.isWorking.get();
        var startDatePicker = tmpl.$('#start-date').pickadate('picker');
        var startDate = new Date(startDatePicker.get());
        var completeDatePicker = tmpl.$('#complete-date').pickadate('picker');
        var comleteDate = new Date(completeDatePicker.get());

        var job = {
            title: title,
            company: company,
            description: description,
            startAt: startDate,
            isWorking: isWorking
        };

        var isValidStart = moment(startDate).isValid();
        if(!isValidStart){
            VZ.notify('Select start date');
            return;
        }
        var isValidComplete = moment(comleteDate).isValid();
        if (!isWorking && isValidComplete) {
            job.completeAt = comleteDate;
        }
        else if (!isWorking && !isValidComplete) {
            VZ.notify('Select complete date');
            return;
        }
        Meteor.call('addWorkExperience', job, function (error, result) {
            if (!error) {
                VZ.notify('Success');
                var startDatePicker = tmpl.$('#start-date').pickadate('picker');
                var completeDatePicker = tmpl.$('#complete-date').pickadate('picker');

                tmpl.$('#company').val('');
                tmpl.$('#title').val('');
                tmpl.$('#job-description').val('');
                startDatePicker.clear();
                completeDatePicker.clear();
                tmpl.isWorking.set(false);
            }
            else {
                VZ.notify(error.message.replace(/[[0-9]+]/gi, ''));
            }
        });
    }
});

var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};