import { VZ } from '/imports/startup/both/namespace';
import { Projects } from '/imports/api/projects/projects';
import './task-item.html';

Template.taskItem.onCreated(function () {
});

Template.taskItem.onRendered(function () {
});

Template.taskItem.onDestroyed(function () {
});

Template.taskItem.helpers({
    canEditTask: function () {
        return VZ.canUser('editTask', Meteor.userId(), this._id);
    },
    relatedProject: function () {
        return Projects.findOne(this.projectId);
    }
});

Template.taskItem.events({
});
