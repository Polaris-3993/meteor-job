import './company-contacts.html';

Template.companyDetailCompanyContactsCard.helpers({
    companyContacts: function () {
        return this.info
    }
})