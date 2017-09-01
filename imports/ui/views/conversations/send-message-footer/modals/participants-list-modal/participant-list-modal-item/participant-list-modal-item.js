import { VZ } from '/imports/startup/both/namespace';
import './participant-list-modal-item.html';

Template.participantsListModalItem.events({
    'click .remove-participant-icon': function (event, tmpl) {
        Meteor.call('removeParticipantsFromConversation',
            tmpl.data.conversationId, tmpl.data.participant._id, function (err) {
                if (err) {
                    VZ.notify(err.message);
                }
            });
    }
});