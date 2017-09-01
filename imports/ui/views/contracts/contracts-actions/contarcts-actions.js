import { VZ } from '/imports/startup/both/namespace';
import './contarcts-actions.html';

Template.contractActions.onRendered(function () {
    this.$('.dropdown-button').dropdown({
        inDuration: 100,
        outDuration: 125,
        constrain_width: false, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on hover
        gutter: 0, // Spacing from edge
        // belowOrigin: false, // Displays dropdown below the button
        // alignment: 'left' // Displays dropdown with edge aligned to the left of button
    });
});

Template.contractActions.helpers({
    canViewContract: function () {
        return VZ.canUser('viewContract', Meteor.userId(), this.data._id);
    },
    canDeleteContract: function () {
        return VZ.canUser('deleteContract', Meteor.userId(), this.data._id);
    },
    canEditContract: function () {
        return VZ.canUser('editContract', Meteor.userId(), this.data._id);
    }
});