import { Projects } from '/imports/api/projects/projects';
import './create-edit-task-modal-proj.html';

Template.tasksProjectModalPicker.onCreated(function () {
    this.projectFilter = new ReactiveVar();
});
Template.tasksProjectModalPicker.onRendered(function () {
    this.$('.modal').modal();
    this.$('.modal').modal('open');
    var self = this;
    $('.lean-overlay').on('click', function () {
        removeTemplate(self.view);
    });
});
Template.tasksProjectModalPicker.onDestroyed(function () {
    $('.lean-overlay').remove();
});

Template.tasksProjectModalPicker.helpers({
    projects: function () {
        var filter = Template.instance().projectFilter.get();
        if (filter && filter.trim().length > 0) {
            return Projects.find({name: {$regex: filter, $options: 'gi'}, archived: false});
        } else {
            return Projects.find();
        }
    }
});

Template.tasksProjectModalPicker.events({
    'click .select-project-button': function (event, tmpl) {
        event.preventDefault();
        tmpl.data.onProjectSelected(this._id);
        tmpl.$('#tasks-project-modal-picker').modal('close');
        removeTemplate(tmpl.view);
    },
    'input #filter-project': function (event, tmpl) {
        event.preventDefault();
        var string = $(event.currentTarget).val();
        tmpl.projectFilter.set(string);
    }
});

var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};