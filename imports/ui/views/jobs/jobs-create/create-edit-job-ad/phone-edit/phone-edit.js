import './phone-edit.html';

Template.phoneEdit.onRendered(function () {
    this.$('#contact-phone').intlTelInput({
        preferredCountries: [],
        autoFormat: true,
        initialCountry: 'auto',
        geoIpLookup: function (callback) {
            Meteor.call('getUserCountry', function (error, result) {
                if (!error) {
                    callback(result.data.country);
                }
            });
        }
    });
});
Template.phoneEdit.helpers({
    isValidPhone: function () {
        return Template.instance().data.isValid('contact-phone');
    }
});