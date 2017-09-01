import './participant.html';

import { VZ } from '/imports/startup/both/namespace';
Template.participant.helpers({
    canRejectParticipant: function () {
        var conversationId = this.conversationId;
        return VZ.canUser('addParticipantToConversation', Meteor.userId(), conversationId);
    }
});

Template.participant.events({
    'click .remove-participant': function (event, tmpl) {
        Meteor.call('removeParticipantsFromConversation',
            tmpl.data.conversationId, tmpl.data.participant._id, function (err) {
                if (err) {
                    VZ.notify(err.message);
                }
            });
    }
});

