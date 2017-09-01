import { VZ } from '/imports/startup/both/namespace';
import './projects-actions.html';

Template.projectActions.onCreated(function () {
   // console.log(this);
});
Template.projectActions.onRendered(function () {
    this.$('.dropdown-button').dropdown({
        // inDuration: 100,
        // outDuration: 125,
        // constrain_width: false, // Does not change width of dropdown to that of the activator
        // hover: false, // Activate on hover
        // gutter: 0, // Spacing from edge
        // // belowOrigin: true, // Displays dropdown below the button
        // alignment: 'right' // Displays dropdown with edge aligned to the left of button
    });
});

Template.projectActions.helpers({
    canEditProject: function () {
        return VZ.canUser('editProject', Meteor.userId(), this._id);
    }
});

Template.projectActions.events({
    'click #archive-project': function (event, tmpl) {
        event.preventDefault();
        var projectId = this._id;
        Session.set('projectsFormChanged',  false);
        Meteor.call('archiveProject', projectId, function (error, result) {
            if(!error){
                VZ.notify('Archived');
                Session.set('projectsFormChanged',  true);
            }
            else {
                VZ.notify(error.message);
            }
        });
    }
});