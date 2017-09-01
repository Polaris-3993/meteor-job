export const ContractsStatusChanges = new Mongo.Collection('vz-contracts-status-changes');
const schema = new SimpleSchema({
    contractId: {
        type: String
    },

    status: {
        type: String,
        allowedValues: ["pending", "active", "paused", "ended", "declined"]
    },

    changedAt: {
        type: Date
    },

    changedByUserId: {
        type: String
    }
});

if (!Meteor.settings.dontUseSchema) {
    ContractsStatusChanges.attachSchema(schema);
}
