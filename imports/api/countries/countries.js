export const Countries = new Mongo.Collection('vj-countries');

const CountriesSchema = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    countryCode: {
        type: String
    },
    label: {
        type: String
    },
    continentCode: {
        type: String,
        optional: true
    }
});

if (!Meteor.settings.dontUseSchema) {
    Countries.attachSchema(CountriesSchema);
}
