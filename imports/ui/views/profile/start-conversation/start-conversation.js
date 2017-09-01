import { VZ } from '/imports/startup/both/namespace';
import './start-conversation.html';

import { Conversations } from '/imports/api/conversations/conversations';

Template.startConversation.events({
    'click .start-conversation-icon': function (event, tmpl) {
        var participantId = tmpl.data.participantId;
        var existingConversation = Conversations.findOne({
            isPrivate: true,
            participantsIds: {$all: [participantId, Meteor.userId()]}
        });

        if (existingConversation) {
            Meteor.call('openConversationWindow', existingConversation._id);
        } else {
            Meteor.call('createPrivateConversation', participantId, function (err, res) {
                if (err) {
                    VZ.notify(err.message);
                } else {
                    Meteor.call('openConversationWindow', res);
                }
            });
        }
    }
});