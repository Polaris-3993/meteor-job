import './company-owner.html';

Template.companyOwner.onCreated(function () {
    var self = this;
    var ownerId = this.data.ownerId || '';
    this.autorun(function () {
        self.subscribe('user', ownerId);
    });
});
Template.companyOwner.helpers({
    userName(userId){
        var user = Meteor.users.findOne({_id: userId}, {
            fields: {profile: 1, roles: 1, emails: 1}
        });
        return  user && user.profile && user.profile.fullName;
    }
});