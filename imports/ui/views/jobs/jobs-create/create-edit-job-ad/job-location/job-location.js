import { Countries } from '/imports/api/countries/countries';
import './job-location.html';

Template.jobLocation.onCreated(function () {
    this.selectedCountryCode = new ReactiveVar(this.data.selectedLocation.countryCode);
    this.selectedCity = new ReactiveVar(this.data.selectedLocation.city);


    var self = this;
    this.autorun(function () {
        var country = self.selectedCountryCode.get();
        var city = self.selectedCity.get();
        self.data.changeLocation({countryCode: country, city: city});
    });
});

Template.jobLocation.onRendered(function () {
    var self = this;

    $('#job-location-country').material_select();

    GoogleMaps.load({
        v: '3', key: Meteor.settings.public.MAPS_API_KEY, libraries: 'geometry,places',
        language: 'en'
    });

    this.autorun(function () {
        if (GoogleMaps.loaded()) {
            var options = {
                types: ['(cities)']
            };

            var input = document.getElementById('job-location-city');
            self.cityAutocomplete = new google.maps.places.Autocomplete(input, options);

            google.maps.event.addListener(self.cityAutocomplete, 'place_changed', function () {
                var result = self.cityAutocomplete.getPlace();
                $(input).blur();

                result.address_components.forEach(function (addressObj) {
                    addressObj.types.forEach(function (addressType) {
                        if (addressType == 'locality') {
                            self.selectedCity.set(addressObj.short_name);
                        }
                    });
                });

            });
        }
    });

    this.autorun(function () {
        var country = self.selectedCountryCode.get();
        if (GoogleMaps.loaded()) {
            self.cityAutocomplete.setComponentRestrictions({'country': country});
        }
    });
});

Template.jobLocation.onDestroyed(function () {
    $('#job-location-country').material_select('destroy');
});

Template.jobLocation.helpers({
    selectedCountry: function () {
        var country = Countries.findOne({countryCode: Template.instance().selectedCountryCode.get()});
        return country ? country.label : '';
    },
    isValidCountry: function () {
        return Template.instance().data.isValid('country-input');
    },
    isValidCity: function () {
        return Template.instance().data.isValid('job-location-city');
    }
});


Template.jobLocation.events({
    'input #country-input': function (event, tmpl) {
        var $input = $(event.target),
            val = $input.val();
        var list = $input.attr('list'),
            match = $('#' + list + ' option').filter(function () {
                return ($(this).val() === val);
            });
        if (match.length > 0) {
            tmpl.selectedCountryCode.set(match[0].id);
            tmpl.selectedCity.set(null);
            tmpl.$('#job-location-city').val('');
        }
        else {
            tmpl.selectedCountryCode.set(null);
            tmpl.selectedCity.set(null);
            tmpl.$('#job-location-city').val('');
        }
    },

    'blur #job-location-city': function (event, tmpl) {
        var typedCity = event.target.value;
        tmpl.selectedCity.set(typedCity);
    }
});