import { Companies } from '/imports/api/companies/companies';

import './company-verifying.html';

Template.companyVerifying.helpers({
    companies: function () {
        return Companies.find();
    }
});