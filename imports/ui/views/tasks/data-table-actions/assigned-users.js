import './assigned-users.html';

Template.assignedTaskUsers.onCreated(function () {
    var self = this;
    var membersIds = this.data.membersIds || [];
    this.autorun(function () {
        self.subscribe('assignedUsers', membersIds);
    });
});
Template.assignedTaskUsers.helpers({
    userName(userId){
        var user = Meteor.users.findOne({_id: userId}, {
            fields: {profile: 1, roles: 1, emails: 1}
        });
        return  user && user.profile && user.profile.fullName;
    }
});