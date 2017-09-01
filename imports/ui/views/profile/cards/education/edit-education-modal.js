import { VZ } from '/imports/startup/both/namespace';
import './edit-education-modal.html';

Template.editEducationModal.onCreated(function () {
    var isStudy = this.data.education ? this.data.education.isStudy : false;
    this.isStudy = new ReactiveVar(isStudy);
});

Template.editEducationModal.onRendered(function () {
    var self = this;
    this.$('.modal').modal();
    this.$('.modal').modal('open');
    $('.datepicker').pickadate({
        selectMonths: true,
        selectYears: 15
    });
    this.$('textarea#education-description').characterCounter();
    this.$('#education-description').trigger('autoresize');
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


    if (this.data.education) {
        startDate.set('select', this.data.education.startAt);
        if (!this.data.education.isStudy) {
            completeDate.set('select', this.data.education.completeAt);
        }
    }

});
Template.editEducationModal.onDestroyed(function () {
    $('.lean-overlay').remove();
});
Template.editEducationModal.helpers({
    currentlyStudy: function () {
        return Template.instance().isStudy.get();
    }
});

Template.editEducationModal.events({
    'change #filled-in-box': function (event, tmpl) {
        event.preventDefault();
        var isStudy = event.target.checked;
        tmpl.isStudy.set(isStudy);
    },
    'click .save': function (event, tmpl) {
        event.preventDefault();
        var school = tmpl.$('#school').val().trim();
        var degree = tmpl.$('#degree').val().trim();
        var description = tmpl.$('#education-description').val().trim();
        var isStudy = tmpl.isStudy.get();
        var startDatePicker = tmpl.$('#start-date').pickadate('picker');
        var startDate = new Date(startDatePicker.get());
        var completeDatePicker = tmpl.$('#complete-date').pickadate('picker');
        var comleteDate = new Date(completeDatePicker.get());

        var education = {
            school: school,
            degree: degree,
            description: description,
            startAt: startDate,
            isStudy: isStudy
        };

        var isValidStart = moment(startDate).isValid();
        if(!isValidStart){
            VZ.notify('Select start date');
            return;
        }
        var isValidComplete = moment(comleteDate).isValid();
        if (!isStudy && isValidComplete) {
            education.completeAt = comleteDate;
        }
        else if (!isStudy && !isValidComplete) {
            VZ.notify('Select complete date');
            return;
        }
        tmpl.data.onEducationInsertEdit(education, tmpl);
    },
    'click .cancel': function (event, tmpl) {
        event.preventDefault();
        tmpl.$('#edit-education-modal').modal('close');
        removeTemplate(tmpl.view);
    },
    'click .add-more': function (event, tmpl) {
        event.preventDefault();
        var school = tmpl.$('#school').val().trim();
        var degree = tmpl.$('#degree').val().trim();
        var description = tmpl.$('#education-description').val().trim();
        var isStudy = tmpl.isStudy.get();
        var startDatePicker = tmpl.$('#start-date').pickadate('picker');
        var startDate = new Date(startDatePicker.get());
        var completeDatePicker = tmpl.$('#complete-date').pickadate('picker');
        var comleteDate = new Date(completeDatePicker.get());

        var education = {
            school: school,
            degree: degree,
            description: description,
            startAt: startDate,
            isStudy: isStudy
        };

        var isValidStart = moment(startDate).isValid();
        var isValidComplete = moment(comleteDate).isValid();
        if (!isStudy && isValidComplete) {
            education.completeAt = comleteDate;
        }
        else if (!isStudy && !isValidComplete) {
            VZ.notify('Select complete date');
            return;
        }
        else if(!isValidStart){
            VZ.notify('Select start date');
            return;
        }
        Meteor.call('addEducation', education, function (error, result) {
            if (!error) {
                VZ.notify('Success');
                var startDatePicker = tmpl.$('#start-date').pickadate('picker');
                var completeDatePicker = tmpl.$('#complete-date').pickadate('picker');

                tmpl.$('#school').val('');
                tmpl.$('#degree').val('');
                tmpl.$('#education-description').val('');
                startDatePicker.clear();
                completeDatePicker.clear();
                tmpl.isStudy.set(false);
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