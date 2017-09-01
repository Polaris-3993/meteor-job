import './company-description.html';

Template.companyDetailCompanyDescriptionCard.helpers({
    companyDescription: function () {
        return this.info;
    }
})