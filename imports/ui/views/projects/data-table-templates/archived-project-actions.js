import { VZ } from '/imports/startup/both/namespace';
import './archived-project-actions.html';

Template.archivedProjectsActions.onRendered(function () {
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
Template.archivedProjectsActions.helpers({
    canEditProject: function () {
        return VZ.canUser('editProject', Meteor.userId(), this._id);
    }
});

Template.archivedProjectsActions.events({
   'click #restore-project': function (event, tmpl) {
       event.preventDefault();
       var projectId = this._id;
       Session.set('projectsFormChanged',  false);
       Meteor.call('restoreProject', projectId, function (error, result) {
           if(!error){
               VZ.notify('Restored');
               Session.set('projectsFormChanged',  true);
           }
           else {
               VZ.notify(error.message);
           }
       });
   }
});