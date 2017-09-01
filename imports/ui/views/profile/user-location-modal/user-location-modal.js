import './user-location-modal.html';

Template.userLocationModal.onCreated(function () {
});

Template.userLocationModal.onRendered(function () {
    var self = this;

    this.$('.modal').modal();
    this.$('.modal').modal('open');

    this.autorun(function () {
        // Template.currentData();
        if (GoogleMaps.loaded()) {
            google.maps.event.trigger(GoogleMaps.maps.profileLocationMap.instance, 'resize')
        }
    });
    this.$('.lean-overlay').on('click', function () {
        removeTemplate(self.view);
    });
});

Template.userLocationModal.onDestroyed(function () {
    this.$('.lean-overlay').remove();
});

Template.userLocationModal.helpers({
    haveLocation: function () {
        return Template.instance().data.haveLocation;
    },
    mapOptions: function () {
        var tmpl = Template.instance();
        return {
            coordinates: {
                lat: tmpl.data.coordinates.lat,
                lng: tmpl.data.coordinates.lng
            }
        }
    }
});

var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};