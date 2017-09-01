import { VZ } from '/imports/startup/both/namespace';
import './edit-location-card.html';

Template.editLocationCard.onCreated(function () {
    this.location = new ReactiveVar(null);


    this.getNormalLocation = function (geoObj) {
        var result = {};

        result.coordinates = typeof(geoObj.geometry.location.lat) === 'function'
            ? {lat: geoObj.geometry.location.lat(), lng: geoObj.geometry.location.lng()}
            : {lat: geoObj.geometry.location.lat, lng: geoObj.geometry.location.lng};


        _.each(geoObj.address_components, function (component) {
            result[component.types[0]] = component.long_name;
        });

        return result
    };
});

Template.editLocationCard.onRendered(function () {
    if (Meteor.user().profile && Meteor.user().profile.location) {
        var location = Meteor.user().profile.location;
        this.$('#editLocationInput').val(location.country + ', ' + location.locality);
    }

    Template.profileCardList.updateMasonry();
    var self = this;
    this.autorun(function () {
        if (GoogleMaps.loaded()) {
            self.$('#editLocationInput').geocomplete().bind('geocode:result', function (e, res) {
                self.location.set(self.getNormalLocation(res));
            });
        }
    });
});

Template.editLocationCard.helpers({
    isCanBeSaved: function () {
        return !!Template.instance().location.get();
    }
});

Template.editLocationCard.events({
    'click .save-location': function (event, tmpl) {
        event.preventDefault();
        var location = tmpl.location.get();
        if (location) {
            Meteor.call('updateUserLocation', location, function (err, res) {
                if (err) {
                    VZ.notify('Failed to update location');
                } else {
                    VZ.notify('Location updated');
                    tmpl.data.set(false);
                }
            });
        } else {
            VZ.notify("No location registered");
        }
    },

    'click .autolocate-btn': function (event, tmpl) {
        event.preventDefault();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (pos) {
                HTTP.get('https://maps.googleapis.com/maps/api/geocode/json', {
                    params: {
                        key: Meteor.settings.public.MAPS_API_KEY,
                        latlng: pos.coords.latitude + ',' + pos.coords.longitude,
                        language: 'en'
                    }
                }, function (err, res) {
                    if (err) {
                        console.log(err);
                        VZ.notify('Failed to geolocate. Make sure your browser supports geolocation and you allowed it')
                    } else {
                        tmpl.$('#editLocationCard').val(res.data.results[0].formatted_address);

                        var location = tmpl.getNormalLocation(res.data.results[0]);
                        tmpl.location.set(location);
                        VZ.notify('Geolocated');
                        tmpl.$('#editLocationInput')
                            .val(location.country + ', ' + location.locality);
                    }
                })
            })
        }
    }
});