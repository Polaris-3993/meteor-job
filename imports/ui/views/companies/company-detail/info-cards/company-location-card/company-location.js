import './company-location.html';

Template.companyDetailCompanyLocationCard.helpers({
    mapOptions: function () {
        return Template.currentData().info
    }
})