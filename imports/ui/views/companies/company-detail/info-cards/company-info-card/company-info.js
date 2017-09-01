import './company-info.html';

Template.companyDetailCompanyInfoCard.helpers({
    companyInfo: function () {
        return this.info;
    }
})