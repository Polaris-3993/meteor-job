import { Companies } from '/imports/api/companies/companies';
import './companies-search.html';

Template.companiesSearch.helpers({
    companies: function () {
        return Companies.find().fetch();
    }
});