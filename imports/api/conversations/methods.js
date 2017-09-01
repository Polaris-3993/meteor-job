import { Conversations } from './conversations';
import { Messages } from '/imports/api/messages/messages';
import { VZ } from '/imports/startup/both/namespace';

Meteor.methods({
    'createConversation': function (title, participantsIds) {
        participantsIds = participantsIds || [];

        var conversation = {
            ownerId: Meteor.userId(),
            participantsIds: participantsIds,
            isPrivate: false
        };

        if (title) {
            conversation.title = title;
        }

        var conversationId = Conversations.insert(conversation);

        Roles.addUsersToRoles(conversation.ownerId, ['conversation-owner', 'conversation-member'],
            conversationId);

        Roles.addUsersToRoles(conversation.participantsIds, 'conversation-member',
            conversationId);

        return conversationId;
    },

    'createPrivateConversation': function (participantId) {
        var conversation = {
            participantsIds: [participantId, Meteor.userId()],
            isPrivate: true
        };

        var conversationId = Conversations.insert(conversation);
        Roles.addUsersToRoles(conversation.participantsIds, 'conversation-member',
            conversationId);

        return conversationId;
    },

    'addParticipantsToConversation': function (conversationId, participantsIds) {
        if (VZ.canUser('addParticipantToConversation', this.userId, conversationId)) {
            participantsIds = _.isArray(participantsIds) ? participantsIds : [participantsIds];

            Conversations.update({_id: conversationId}, {
                $addToSet: {participantsIds: {$each: participantsIds}}
            });
            Roles.addUsersToRoles(participantsIds, 'conversation-member', conversationId);
        } else {
            throw  new Meteor.Error('You\'re not a conversation owner!');
        }
    },

    'removeParticipantsFromConversation': function (conversationId, participantsIds) {
        if (VZ.canUser('addParticipantToConversation', this.userId, conversationId)) {
            participantsIds = _.isArray(participantsIds) ? participantsIds : [participantsIds];

            Conversations.update({_id: conversationId}, {
                $pullAll: {participantsIds: participantsIds}
            });
            Roles.removeUsersFromRoles(participantsIds, 'conversation-member', conversationId);
        } else {
            throw  new Meteor.Error('You\'re not a conversation owner!');
        }
    },

    'changeConversationTitle': function (conversationId, title) {
        if (VZ.canUser('editConversation', this.userId, conversationId)) {
            Conversations.update({_id: conversationId}, {
                $set: {title: title}
            });
        } else {
            throw  new Meteor.Error('You\'re not a conversation owner!');
        }
    },


    'openConversationWindow': function (conversationId) {
        if (VZ.canUser('viewConversation', this.userId, conversationId)) {
            var user = Meteor.user();

            user.activeConversationWindowsIds ?
                Meteor.users.update(user._id,
                    {$addToSet: {activeConversationWindowsIds: conversationId}}) :
                Meteor.users.update(user._id, {$set: {activeConversationWindowsIds: [conversationId]}});
        } else {
            throw  new Meteor.Error('You\'re not a conversation member!');
        }
    },

    'closeConversationWindow': function (conversationId) {
        if (VZ.canUser('viewConversation', this.userId, conversationId)) {
            Meteor.users.update(this.userId,
                {$pull: {activeConversationWindowsIds: conversationId}})
        } else {
            throw  new Meteor.Error('You\'re not a conversation member!');
        }
    },


    'sendMessage': function (conversationId, messageText) {
        if (VZ.canUser('viewConversation', this.userId, conversationId)) {
            var message = {
                text: messageText,
                conversationId: conversationId,
                senderId: Meteor.userId(),
                readBy: [{participantId: Meteor.userId(), readAt: new Date()}],
                sentAt: new Date()
            };
        } else {
            throw  new Meteor.Error('You\'re not a conversation member!');
        }

        return Messages.insert(message);
    },
    'readMessage': function (messageId) {
        var message = Messages.findOne({
            _id: messageId,
            'readBy.participantId': {$ne: Meteor.userId()}
        });
        if (!message) {
            throw  new Meteor.Error('Message is not found or already read!');
        }

        var conversationId = message.conversationId;

        if (VZ.canUser('viewConversation', this.userId, conversationId)) {
            Messages.update({_id: messageId}, {
                $push: {
                    readBy: {
                        participantId: Meteor.userId(),
                        readAt: new Date()
                    }
                }
            });
        } else {
            throw  new Meteor.Error('You\'re not a conversation member!');
        }

        return messageId;
    },
    'readAllMessages': function (conversationId) {
        if (VZ.canUser('viewConversation', this.userId, conversationId)) {
            var unreadMessages = Messages.find({
                conversationId: conversationId,
                'readBy.participantId': {$ne: Meteor.userId()}
            }).fetch();
            var unreadMessagesIds = _.map(unreadMessages, function (message) {
                return message._id;
            });
            Messages.update({_id: {$in: unreadMessagesIds}}, {
                $push: {
                    readBy: {
                        participantId: Meteor.userId(),
                        readAt: new Date()
                    }
                }
            }, {multi: true});
        } else {
            throw  new Meteor.Error('You\'re not a conversation member!');
        }
    },
    'deleteMessage': function (messageId) {
        var message = Messages.findOne({
            _id: messageId,
            'deletedBy.participantId': {$ne: Meteor.userId()}
        });
        if (!message) {
            throw  new Meteor.Error('Message is not found or already deleted!');
        }

        var conversationId = message.conversationId;

        if (VZ.canUser('viewConversation', this.userId, conversationId)) {
            Messages.update({_id: messageId}, {
                $push: {
                    deletedBy: {
                        participantId: Meteor.userId(),
                        deletedAt: new Date()
                    }
                }
            });
        } else {
            throw  new Meteor.Error('You\'re not a conversation member!');
        }
    },

    getMessagesQuery: function (conversationId, messageIdOrPageNumber, computeFromId) {
        if (!VZ.canUser('viewConversation', this.userId, conversationId)) {
            throw  new Meteor.Error('You\'re not a conversation member!');
        }

        if (computeFromId) {
            var targetMessage = Messages.findOne(messageIdOrPageNumber);
            if (targetMessage) {
                var allMessages = Messages.find({conversationId: conversationId},
                    {sort: {sentAt: -1}}).fetch();
                var allMessagesIds = _.map(allMessages, function (mess) {
                    return mess._id;
                });

                var targetMessagePos = _.indexOf(allMessagesIds, targetMessage._id);
                var messageBeforePos = targetMessagePos + 29 < allMessagesIds.length - 1
                    ? targetMessagePos + 29 : allMessagesIds.length - 1;
                var messageAfterPos = targetMessagePos - 30 > 0 ? targetMessagePos - 30 : 0;

                var firstMessage = allMessages[messageBeforePos];
                var lastMessage = allMessages[messageAfterPos];

                return {
                    query: {
                        sentAt: {
                            $gte: firstMessage.sentAt,
                            $lte: lastMessage.sentAt
                        }
                    },
                    isDno: targetMessagePos + 29 > allMessagesIds.length,
                    pageNumber: Math.floor(targetMessagePos / 30)
                };
            } else {
                return false;
            }
        } else {
            var DEF_LIMIT = 60;

            var pageNumber = messageIdOrPageNumber;
            var allMessagesCount = Messages.find({conversationId: conversationId}).count();

            if (allMessagesCount <= 0) {
                return false;
            }

            var skip = pageNumber * 30;
            var isDno = allMessagesCount <= DEF_LIMIT || skip > allMessagesCount - DEF_LIMIT;

            if (allMessagesCount <= DEF_LIMIT) {
                isDno = true;
                skip = 0;
            } else if (skip > allMessagesCount - DEF_LIMIT) {
                isDno = true;
                skip = allMessagesCount - DEF_LIMIT;
            }

            var messagesForCurrentPage = Messages.find({conversationId: conversationId}, {
                sort: {sentAt: -1},
                limit: DEF_LIMIT,
                skip: skip
            }).fetch();

            var firstMessage = messagesForCurrentPage[0];
            var lastMessage = messagesForCurrentPage[messagesForCurrentPage.length - 1];

            var query = {
                sentAt: {
                    $gte: lastMessage.sentAt
                }
            };
            if (pageNumber > 0) {
                query.sentAt.$lte = firstMessage.sentAt
            }
            return {
                query: query,
                isDno: isDno
            };
        }
    }
});