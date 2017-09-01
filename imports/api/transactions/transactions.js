export const Transactions = new Mongo.Collection('vz-transactions');

Transactions.allow({
    insert: function (userId, doc) {
        return userId == 'wh8or4SeGKKr5WTDs';
    },
    update: function (userId, doc) {
        return userId == 'wh8or4SeGKKr5WTDs';
    }
});

const schema = new SimpleSchema({
    workerId: {
        type: String
    },
    employerId: {
        type: String
    },
    paymentReference: {
        type: String
    },
    amountCurrency: {
        type: String
    },
    sourceCurrency: {
        type: String
    },
    amount: {
        type: Number,
        decimal: true
    },
    status: {
        type: String
    },
    createdAt: {
        type: Date,
        optional: true
    },
    updatedAt: {
        type: Date,
        optional: true
    },
    bankAccountId: {
        type: String,
        optional: true
    }
});

if (!Meteor.settings.dontUseSchema) {
    Transactions.attachSchema(schema);
}
