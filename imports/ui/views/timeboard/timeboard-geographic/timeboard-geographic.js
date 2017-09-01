import './timeboard-geographic.html';

Template.timeBoardGeographic.onCreated(function () {
});

Template.timeBoardGeographic.onRendered(function () {
});

Template.timeBoardGeographic.helpers({
    mapOptions: function () {
        var user = Meteor.user();
        if(user.profile.location && user.profile.location.coordinates){
            return {
                coordinates: {
                    lat: user.profile.location.coordinates.lat,
                    lng: user.profile.location.coordinates.lng
                }
            }
        } 
        return 
    }
});

Template.timeBoardGeographic.events({});