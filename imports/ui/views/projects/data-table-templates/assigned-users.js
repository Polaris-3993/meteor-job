import './assigned-users.html';

Template.assignedUsers.onCreated(function () {
    var self = this;
    var assignedUsersIds = this.data.assignedUsersIds || [];
    this.autorun(function () {
        self.subscribe('assignedUsers', assignedUsersIds);
    });
});
Template.assignedUsers.helpers({
    userName(userId){
        var user = Meteor.users.findOne({_id: userId}, {
            fields: {profile: 1, roles: 1, emails: 1}
        });
        return  user && user.profile && user.profile.fullName;
    }
});