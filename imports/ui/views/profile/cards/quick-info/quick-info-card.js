import { VZ } from '/imports/startup/both/namespace';
import './quick-info-card.html';

Template.quickInfoCard.onCreated(function () {
    this.getSocialIconName = function (socialName) {
        switch (socialName) {
            case 'Facebook':
                return 'fa fa-facebook';
            case 'Twitter':
                return 'fa fa-twitter';
            case 'Google+':
                return 'fa fa-google-plus';
            case 'Pinterest':
                return 'fa fa-pinterest';
            case 'LinkedIn':
                return 'fa fa-linkedin';
        }
    };

    this.getSocialName = function (socialName) {
        switch (socialName) {
            case 'Facebook':
                return 'facebook';
            case 'Twitter':
                return 'twitter';
            case 'Google+':
                return 'gplus';
            case 'Pinterest':
                return 'pinterest';
            case 'LinkedIn':
                return 'linkedin';
        }
    };
});

Template.quickInfoCard.onRendered(function () {

});

Template.quickInfoCard.helpers({
    profileOwner: function () {
        return isProfileOwner();
    },
    socialIcon: function (socialName) {
        return Template.instance().getSocialIconName(socialName);
    },
    socialName: function (socialName) {
        return Template.instance().getSocialName(socialName);
    },
    profileLanguages: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (user.profile.languages)
            return user.profile.languages.toString().replace(/,/g, ', ');
        else
            return [];
    },
    personalWebsite: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (user.profile.personalWebsite) {
            return user.profile.personalWebsite;
        }
    },
    formatWebsite: function (link) {
        return link ? link.replace('https://', '').trim() : '';
    },
    profileSocial: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (user.profile.socialMedias)
            return user.profile.socialMedias;
        else
            return [];
    },
});

Template.quickInfoCard.events({
    'click .edit-icon': function (event, tmpl) {
        event.preventDefault();
        var user = Meteor.users.findOne({_id: Meteor.userId()});
        if (!user || !user.profile) {
            return;
        }
        var getSocialIconName = tmpl.getSocialIconName;
        var profile = user && user.profile;
        var parentNode = $('body')[0],
            onUserEdit = function (user) {
                Meteor.call('updateProfileMedia', user, function (error, result) {
                    if (!error) {
                        VZ.notify('Success');
                    }
                });
            },
            modalData = {
                profile: profile,
                onUserEdit: onUserEdit,
                getSocialIconName: getSocialIconName
            };
        Blaze.renderWithData(Template.editQuickInfoModal, modalData, parentNode);
    }

});

function isProfileOwner() {
    var user = Meteor.users.findOne({_id: Router.current().params.id});
    if (user) {
        return Meteor.userId() === user._id;
    }
    return false
}