import { Conversations } from '../conversations';
import { Messages } from '/imports/api/messages/messages';
import { VZ } from '/imports/startup/both/namespace';

Meteor.publishComposite('conversation', function (conversationId) {
    var userId = this.userId;
    return {
        find: function () {
            if (VZ.canUser('viewConversation', userId, conversationId)) {
                return Conversations.find({_id: conversationId});
            } else {
                this.ready();
            }
        },
        children: [{
            find: function (conversation) {
                return Meteor.users.find({_id: {$in: conversation.participantsIds}});
            }
        }]
    }
});

Meteor.publishComposite('allConversations', function () {
    var userId = this.userId;
    return {
        find: function () {
            var params = {
                $or: [{
                    ownerId: userId
                }, {
                    participantsIds: userId
                }]
            };
            return Conversations.find(params);
        },
        children: [{
            find: function (conversation) {
                var usersIds = _.union(conversation.participantsIds, conversation.ownerId);
                return Meteor.users.find({_id: {$in: usersIds}},
                    {
                        fields: {
                            profile: 1
                        }
                    });
            }
        }, {
            find: function (conversation) {
                return Messages.find({conversationId: conversation._id},
                    {limit: 1, sort: {sentAt: -1}})
            }
        }]
    }
});

Meteor.publish('messages', function (params) {
    var userId = this.userId;
    var conversationId = params.conversationId;
    if (VZ.canUser('viewConversation', userId, conversationId)) {
        _.extend(params, {
            'deletedBy.participantId': {$ne: userId}
        });

        return Messages.find(params);

    } else {
        this.ready();
    }
});

Meteor.publish('singleMessage', function (messageId) {
    var userId = this.userId;
    var message = Messages.findOne(messageId);

    if (message && VZ.canUser('viewConversation', userId, message.conversationId)) {
        return Messages.find(messageId);
    } else {
        this.ready();
    }
});

Meteor.publish('unreadMessages', function (conversationId) {
    var userId = this.userId;
    var options = {limit: 10};

    if (conversationId) {
        if (VZ.canUser('viewConversation', userId, conversationId)) {
            return Messages.find({
                conversationId: conversationId,
                'readBy.participantId': {$ne: userId},
                'deletedBy.participantId': {$ne: userId}
            }, options);
        } else {
            this.ready();
        }
    } else {
        var conversationsIds = [];
        Conversations.find({
            $or: [{
                ownerId: userId
            }, {
                participantsIds: userId
            }]
        }).forEach(function (conversation) {
            conversationsIds.push(conversation._id);
        });

        return Messages.find({
            conversationId: {$in: conversationsIds},
            'readBy.participantId': {$ne: userId},
            'deletedBy.participantId': {$ne: userId}
        }, options);
    }
});

Meteor.publish('activeConversationWindowsIds', function () {
    return Meteor.users.find(this.userId, {fields: {activeConversationWindowsIds: 1}});
});