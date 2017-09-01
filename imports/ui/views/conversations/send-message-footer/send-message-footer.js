import { VZ } from '/imports/startup/both/namespace';
import { Conversations } from '/imports/api/conversations/conversations';
import './send-message-footer.html';
import './modals/modals';


Template.sendMessageFooter.helpers({
    participantCount: function () {
        return this.conversation.participantsIds.length;
    },

    participantId: function () {
        return _.filter(this.conversation.participantsIds, function (id) {
            return id != Meteor.userId();
        })[0];
    }
});

Template.sendMessageFooter.events({
    'keypress .send-message-input': function (event, tmpl) {
        if (event.keyCode == 13) {
            var text = event.target.value;
            if (text.length > 0) {
                var conversationId = tmpl.data.conversation._id;
                Meteor.call('sendMessage', conversationId, text, function (error, res) {
                    if (error) {
                        VZ.notify(error.message);
                    } else {
                        $(event.target).val('');
                    }
                });
            }
        }
    },
    'click .participant-avatar': function (event) {
        var participantId = event.target.id;
        Router.go('userProfile', {id: participantId});
    },
    'click .participant-count': function (event, tmpl) {
        var parentNode = $('body')[0];
        var data = function () {
            return {
                conversation: Conversations.findOne(tmpl.data.conversation._id)
            };
        };
        Blaze.renderWithData(Template.participantsListModal, data, parentNode);
    },
    'click .add-participant': function (event, tmpl) {
        var data = function () {
            return {
                conversation: Conversations.findOne(tmpl.data.conversation._id)
            };
        };
        var parentNode = $('body')[0];
        Blaze.renderWithData(Template.addParticipantModal, data, parentNode);
    }
});