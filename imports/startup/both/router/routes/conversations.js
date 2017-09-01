import { Conversations } from '/imports/api/conversations/conversations';
import { VZ } from '/imports/startup/both/namespace';

Router.map(function () {
    this.route('conversation', {
        path: '/conversation/:id',
        layoutTemplate: 'mainLayout',
        template: 'conversationView',
        waitOn: function () {
            return [this.subscribe('conversation', this.params.id)]
        },
        onBeforeAction: function () {
            var isConversationMember =
                VZ.canUser('viewConversation', Meteor.userId(), this.params.id);

            if (isConversationMember) {
                this.next();
            } else {
                VZ.notify('You\'re not a conversation member!');
                Router.go('home');
            }
        },
        data: function () {
            return {
                pageTitle: 'Conversation',
                conversation: Conversations.findOne(this.params.id)
            }
        }
    });

});