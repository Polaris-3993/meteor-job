import './jobs-list.html';
import './all-jobs';
import './archived-jobs';

Template.jobsList.onCreated(function () {
    this.currentTab = new ReactiveVar('allJobs');
});

Template.jobsList.onRendered(function () {
    this.$('ul.tabs').tabs();
});

Template.jobsList.helpers({
    tab: function () {
        return Template.instance().currentTab.get();
    },
    formСhanged: function () {
        return Session.get('jobsFormChanged');
    }
});

Template.jobsList.events({
    'click .tabs-row li': function (e, tmp) {
        var currentTab = $(e.target).closest('li');
        tmp.currentTab.set(currentTab.data('template'));
    }
});