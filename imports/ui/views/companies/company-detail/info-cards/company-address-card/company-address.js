import './company-adress.html';

Template.companyDetailCompanyAddressCard.onRendered(function () {
})

Template.companyDetailCompanyAddressCard.helpers({
    companyAddress: function () {
        return this.info;
    }
})