import { Conversations } from '/imports/api/conversations/conversations';
import './conversations-manager.html';

Template.conversationsManager.onCreated(function () {
    this.subscribe('activeConversationWindowsIds');
    this.subscribe('allConversations');
});

Template.conversationsManager.helpers({
    activeConversations: function () {
        var activeConversationWindowsIds = Meteor.user().activeConversationWindowsIds || [];
        return Conversations.find({_id: {$in: activeConversationWindowsIds}});
    }
});