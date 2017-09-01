import { VZ } from '/imports/startup/both/namespace';
import './team-item.html';

Template.teamItem.onCreated(function () {
});

Template.teamItem.onRendered(function () {
});

Template.teamItem.onDestroyed(function () {
});

Template.teamItem.helpers({
    canEditTeam: function () {
        return VZ.canUser('editTeam', Meteor.userId(), this._id);
    }
});

Template.teamItem.events({
});
