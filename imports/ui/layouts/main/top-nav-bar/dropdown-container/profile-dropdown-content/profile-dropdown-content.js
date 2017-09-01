import './profile-dropdown-content.html';

Template.profileDropdownContent.helpers({
    profile: function () {
        var profile = Meteor.user().profile;
        var email = Meteor.user().emails[0].address;
        _.extend(profile, {email: email});
        return profile;
    },

    profilePhoto: function () {
        var user = Meteor.user();
        if (!user || !user.profile) {
            return;
        }
        if (!user.profile.photo || !user.profile.photo.small) {
            return '/images/default-lockout.png'
        }

        return user.profile.photo.small;
    }

});

Template.profileDropdownContent.events({
    'click .btn-logout': function () {
        Accounts.logout();
    },
    'click .edit-profile': function (event, tmpl) {
        tmpl.data.closeDropDown();
        Router.go('profile');
    }
});