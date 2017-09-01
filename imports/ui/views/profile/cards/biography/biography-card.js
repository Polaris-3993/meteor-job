import './biography-card.html';

Template.biographyCard.onCreated(function () {
    this.showMore = new ReactiveVar(false);
    this.autorun(function () {
       Template.currentData();
    });

});
Template.biographyCard.onRendered(function () {
    // Template.profileMain.updateMasonry();
    this.autorun(function () {
        Template.currentData();
    });
});
Template.biographyCard.helpers({
    profileBiography: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (user.profile.biography) {
                var biography = user.profile.biography;
                var new_text, small_len = 300;

                if (biography.length > 300 && !Template.instance().showMore.get()) {
                    new_text = biography.substr(0, (small_len - 3)) + '...';
                    return new_text;
                }
            return user.profile.biography;
            }

    },
    showMore: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile || !user.profile.biography) {
            return;
        }
        return user.profile.biography.length > 300 && Template.instance().showMore.get();
    },
    showMoreButton: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile || !user.profile.biography) {
            return;
        }
        return user.profile.biography.length > 300;
    },
    profileOwner: function () {
        return isProfileOwner();
    }

});
Template.biographyCard.events({
    'click .edit-bio': function (event, tmpl) {
        event.preventDefault();
        var user = Meteor.users.findOne({_id: Meteor.userId()});
        var profile = user && user.profile;
        var parentNode = $('body')[0],
            modalData = {
                profile: profile
            };
        Blaze.renderWithData(Template.editBioModal, modalData, parentNode);
    },
    'click .show-more': function (event, tmpl) {
        event.preventDefault();
        tmpl.showMore.set(true);
    },
    'click .show-less': function (event, tmpl) {
        event.preventDefault();
        tmpl.showMore.set(false);
    }
});

function isProfileOwner() {
    var user = Meteor.users.findOne({_id: Router.current().params.id});
    if (user) {
        return Meteor.userId() === user._id;
    }

    return false
}