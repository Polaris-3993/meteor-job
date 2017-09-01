import './all-companies/all-companies';
import './archived-companies/archived-companies';
import './company-item/company-item';
import './data-table-actions/data-table-actions';
import './companies-list.html';

Template.companiesList.onCreated(function () {
    this.currentTab = new ReactiveVar('allCompanies');
});

Template.companiesList.onRendered(function () {
    this.$('ul.tabs').tabs();
});

Template.companiesList.helpers({
    tab: function () {
        return Template.instance().currentTab.get();
    },
    formСhanged: function () {
        return Session.get('companiesFormChanged');
    }
});

Template.companiesList.events({
    'click .tabs-row li': function (e, tmp) {
        var currentTab = $(e.target).closest('li');
        tmp.currentTab.set(currentTab.data('template'));
    }
});