import './team-lead.html';

Template.teamLead.onCreated(function () {
    var self = this;
    if(this.userId){
        var userId = this.userId;
    }
    else {
        var userId = this.data.ownerId || '';
    }

    this.autorun(function () {
        self.subscribe('user', userId);
    });
});
Template.teamLead.helpers({
    userName(userId){
        var user = Meteor.users.findOne({_id: userId}, {
            fields: {profile: 1, roles: 1, emails: 1}
        });
        return  user && user.profile && user.profile.fullName;
    },
    isUserId(userId){
       var user = this.userId;
        return user == userId;
    }
});