import './contracts-list.html';
import './active-contracts/active-contracts';
import './contracts-list-item/contracts-list-item';
import './ended-contracts/ended-contracts';
import './paused-contracts/paused-contracts';
import './pending-contracts/pending-contracts';

Template.contractsList.onCreated(function () {
    this.currentTab = new ReactiveVar('activeContracts');
});

Template.contractsList.onRendered(function () {
    this.$('ul.tabs').tabs();
});

Template.contractsList.helpers({
    tab: function () {
        return Template.instance().currentTab.get();
    },
    formChanged: function () {
        return Session.get('contractsFormChanged');
    }
});

Template.contractsList.events({
    'click .tabs-row li': function (e, tmp) {
        var currentTab = $(e.target).closest('li');
        tmp.currentTab.set(currentTab.data('template'));
    }
});