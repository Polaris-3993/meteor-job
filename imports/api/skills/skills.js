export const Skills = new Mongo.Collection('vj-job-skills');

Skills.allow({
    insert: function (userId, doc) {
        return userId == 'wh8or4SeGKKr5WTDs';
    },
    update: function (userId, doc) {
        return userId == 'wh8or4SeGKKr5WTDs';
    }
});