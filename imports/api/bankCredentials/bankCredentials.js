export const BankCredentials = new Mongo.Collection('vz-bank-credentials');
BankCredentials.allow({
    insert: function (userId, doc) {
        return userId == 'wh8or4SeGKKr5WTDs';
    },
    update: function (userId, doc) {
        return userId == 'wh8or4SeGKKr5WTDs';
    }
});

const schema = new SimpleSchema({
    name: {
        type: String
    },
    recipientEmail: {
        type: String
    },
    receiverType: {
        type: String
    },
    targetCurrency: {
        type: String
    },
    addressFirstLine: {
        type: String
    },
    addressPostCode: {
        type: String
    },
    addressCity: {
        type: String
    },
    addressState: {
        type: String
    },
    addressCountryCode: {
        type: String
    },
    abartn: {
        type: String
    },
    accountNumber: {
        type: String
    },
    accountType: {
        type: String
    },
    userId: {
        type: String
    },
    createdAt: {
        type: Date,
        optional: true
    },

    updatedAt: {
        type: Date,
        optional: true
    }
});

if (!Meteor.settings.dontUseSchema) {
    BankCredentials.attachSchema(schema);
}
