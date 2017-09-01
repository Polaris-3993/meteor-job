export const Screenshots = new Mongo.Collection('vz-time-entries-screenshots');

const screeshotsSchema = new SimpleSchema({
    timeEntryId: {
        type: String
    },

    uploadedAt: {
        type: Date
    },

    takenAt: {
        type: Date
    },

    screenshotThumbnailPreviewURL: {
        type: String,
        optional: true //Conversion takes place later
    },

    screenshotOriginalURL: {
        type: String,
        optional: true //Conversion takes place later
    },
    deleted: {
        type: Boolean,
        optional: true
    },
    keyEvents: {
        type: Number
    },
    mouseEvents: {
        type: Number
    }
});

if (!Meteor.settings.dontUseSchema) {
    Screenshots.attachSchema(screeshotsSchema);
}
