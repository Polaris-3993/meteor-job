export const Conversations = new Mongo.Collection('vz-conversations');

const Conversation = new SimpleSchema({
    title: {
        type: String,
        optional: true
    },
    ownerId: {
        type: String,
        optional: true
    },
    participantsIds: {
        type: [String]
    },
    isPrivate: {
        type: Boolean
    }
});

if (!Meteor.settings.dontUseSchema) {
    Conversations.attachSchema(Conversation);
}

