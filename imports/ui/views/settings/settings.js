import './billing/billing';
import './general/general';
import './notifications/notifications';
import './security/security';
import './settings.html';
Template.settings.onCreated(function () {
    this.currentTab = new ReactiveVar('generalSettings');
});

Template.settings.onRendered(function () {
    this.$('ul.tabs').tabs();
});

Template.settings.helpers({
    tab: function () {
        return Template.instance().currentTab.get();
    }
});

Template.settings.events({
    'click .tabs-row li': function (e, tmp) {
        var currentTab = $(e.target).closest('li');
        tmp.currentTab.set(currentTab.data('template'));
    }
});