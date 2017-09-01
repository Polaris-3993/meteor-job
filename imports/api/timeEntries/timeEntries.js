export const TimeEntries = new Mongo.Collection('vz-time-entries');

const permin = new SimpleSchema({
    keyboard: {
        type: Number
    },

    mouse: {
        type: Number
    },

    time: {
        type: Date
    }
});

const schema = new SimpleSchema({
    message: {
        type: String
    },

    startDate: {
        type: Date,
        optional: true
    },

    endDate: {
        type: Date,
        optional: true
    },

    userId: {
        type: String
    },

    projectId: {
        type: String,
        optional: true
    },

    taskId: {
        type: String,
        optional: true
    },

    contractId: {
        type: String,
        optional: true
    },

    paymentType: {
        type: String,
        optional: true
    },

    paymentRate: {
        type: Number,
        optional: true
    },

    tags: {
        type: [String],
        optional: true
    },

    _done: {
        type: Boolean
    },

    _isManual: {
        type: Boolean,
        defaultValue: false
    },

    _totalMinutes: {
        type: Number,
        optional: true
    },

    _isActive: {
        type: Boolean,
        defaultValue: true
    },

    _initiatedByDesktopApp: {
        type: Boolean
    },

    _trackedByDesktopApp: {
        type: Boolean
    },

    countKeyboardEvents: {
        type: Number,
        optional: true
    },

    countMouseEvents: {
        type: Number,
        optional: true
    },

    countEventsPerMin: {
        type: [permin],
        optional: true
    }

});

if (!Meteor.settings.dontUseSchema) {
    TimeEntries.attachSchema(schema);
}
