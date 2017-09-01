import './company-workers.html';

Template.companyWorkers.onCreated(function () {
    var self = this;
    var workersIds = this.data.workersIds || [];
    this.autorun(function () {
        self.subscribe('assignedUsers', workersIds);
    });
});
Template.companyWorkers.helpers({
    userName(userId){
        var user = Meteor.users.findOne({_id: userId}, {
            fields: {profile: 1, roles: 1, emails: 1}
        });
        return  user && user.profile && user.profile.fullName;
    }
});