import { VZ } from '/imports/startup/both/namespace';
import './tasks-actions.html';

import { Projects } from '/imports/api/projects/projects';
Template.taskActions.onRendered(function () {
    this.$('.dropdown-button').dropdown({
        inDuration: 100,
        outDuration: 125,
        constrain_width: false, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on hover
        gutter: 0, // Spacing from edge
        // belowOrigin: false, // Displays dropdown below the button
        alignment: 'right' // Displays dropdown with edge aligned to the left of button
    });
});

Template.taskActions.helpers({
    canEditTask: function () {
            return VZ.canUser('editTask', Meteor.userId(), this.data._id);
    }
});

Template.taskActions.events({
    'click #archive-task': function (event, tmpl) {
        event.preventDefault();
        var taskId= this.data._id;
        Session.set('tasksFormChanged',  false);
        Meteor.call('archiveTask', taskId, function (error, result) {
            if(!error){
                VZ.notify('Archived');
                Session.set('tasksFormChanged',  true);
            }
            else {
                VZ.notify(error.message);
            }
        });
    },
    'click #restore-task': function (event, tmpl) {
        event.preventDefault();
        var taskId= this.data._id;
        var projectId = this.data.projectId;
        var project = Projects.findOne({_id: projectId});
        Session.set('tasksFormChanged',  false);
        Meteor.call('restoreTask', taskId, function (error, result) {
            if(!error){
                // VZ.notify('Restored');
                Session.set('tasksFormChanged',  true);
                Session.set('taskId', taskId);
                Router.go('projectDashboard', {id: project._id});
            }
            else {
                VZ.notify(error.message);
            }
        });
    }
});