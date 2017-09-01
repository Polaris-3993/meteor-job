export const Messages = new Mongo.Collection('vz-conversations-messages');
const Message = new SimpleSchema({
    text: {
        type: String
    },
    conversationId: {
        type: String
    },
    senderId: {
        type: String
    },
    sentAt: {
        type: Date
    },

    readBy: {
        type: [Object],
        optional: true
    },
    'readBy.$.participantId': {
        type: String
    },
    'readBy.$.readAt': {
        type: Date
    },

    deletedBy: {
        type: [Object],
        optional: true
    },
    'deletedBy.$.participantId': {
        type: String
    },
    'deletedBy.$.deletedAt': {
        type: Date
    }
});

if (!Meteor.settings.dontUseSchema) {
    Messages.attachSchema(Message);
}
