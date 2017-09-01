import './tasks-list.html';
import './all-tasks';
import './archived-tasks';
import './assigned-users-with-photo/assigned-users-with-photo';
import './datatable-checkbox/datatable-checkbox';
import './task-item/task-item';

Template.tasksList.onCreated(function () {
    this.currentTab = new ReactiveVar('allTasks');
});

Template.tasksList.onRendered(function () {
    this.$('ul.tabs').tabs();
});

Template.tasksList.helpers({
    tab: function () {
        return Template.instance().currentTab.get();
    },
    formСhanged: function () {
        return Session.get('tasksFormChanged');
    }
});

Template.tasksList.events({
    'click .tabs-row li': function (e, tmp) {
        var currentTab = $(e.target).closest('li');
        tmp.currentTab.set(currentTab.data('template'));
    }
});
