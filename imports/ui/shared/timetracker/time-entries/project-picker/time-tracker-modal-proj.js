import './time-tracker-modal-proj.html';

import { Projects } from '/imports/api/projects/projects';

Template.timeTrackerProjectModalPicker.onRendered(function () {
    // // change default project
    this.$('.modal').modal();
    this.$('.modal').modal('open');
    var self = this;
    $('.lean-overlay').on('click', function () {
        removeTemplate(self.view);
    });
    //this.data.selectProjectModalParams.onChangeProject(Projects.findOne()._id);
});

Template.timeTrackerProjectModalPicker.helpers({
    projects: function () {
        return Projects.find();
    }
});

Template.timeTrackerProjectModalPicker.events({
    'click .select-project-button': function (event, tmpl) {
        tmpl.data.onProjectSelected(this._id);
        tmpl.$('#time-tracker-project-modal-picker').modal('close');
        removeTemplate(tmpl.view);
    }
});

Template.timeTrackerProjectModalPicker.onDestroyed(function () {
    $('.lean-overlay').remove();
});

var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};