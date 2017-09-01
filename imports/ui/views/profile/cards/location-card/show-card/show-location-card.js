import './show-location-card.html';

Template.showLocationCard.onCreated(function () {
});

Template.showLocationCard.onRendered(function () {
    this.autorun(function () {
        // updateMasonry if user profile(location) was changed
        Template.currentData();
        Template.profileCardList.updateMasonry();
    });
});

Template.showLocationCard.helpers({
    haveLocation: function () {
        Template.profileCardList.updateMasonry();
        var user = Meteor.users.findOne({_id: this.userId}) || Meteor.user();
        return !!user.profile.location
    },
    mapOptions: function () {
        var user = Meteor.users.findOne({_id: this.userId}) || Meteor.user();
        return {
            coordinates: {
                lat: user.profile.location.coordinates.lat,
                lng: user.profile.location.coordinates.lng
            }
        }
    }
});