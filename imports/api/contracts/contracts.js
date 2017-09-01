export const Contracts = new Mongo.Collection('vz-contracts');

const schema = new SimpleSchema({
    name: {
        type: String
    },

    // description: {
    //     type: String
    // },

    createdAt: {
        type: Date
    },

    employerId: {
        type: String
    },

    workerId: {
        type: String
    },

    status: {
        type: String,
        allowedValues: ["pending", "active", "paused", "ended", "declined"]
    },
    paymentInfo: {
        type: Object,
        optional: true
    },

    "paymentInfo.type": {
        type: String,
        allowedValues: ["hourly", "monthly", "fixed"]
    },

    "paymentInfo.rate": {
        type: Number,
        min: 0
    },

    "paymentInfo.weekHoursLimit": {
        type: Number,
        min: 0,
        max: 100
    },

    companyId: {
        type: String,
        optional: true
    },

    projectIds: {
        type: [String],
        min: 1
    }
});

// if (!Meteor.settings.dontUseSchema) {
//     Contracts.attachSchema(schema);
// }
