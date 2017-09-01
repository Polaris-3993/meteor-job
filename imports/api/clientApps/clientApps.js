export const ClientApps = new Mongo.Collection('client-apps');


const ClientAppsSchema = new SimpleSchema({
    _id: {
        type: String,
        optional: false
    },
    lastUpdated: {
        type: Date,
        optional: false
    }
});