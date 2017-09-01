export const Positions = new Mongo.Collection('vz-positions');
Positions.allow({
    insert: function (userId, doc) {
        return userId == 'wh8or4SeGKKr5WTDs';
    },
    update: function (userId, doc) {
        return userId == 'wh8or4SeGKKr5WTDs';
    }
});