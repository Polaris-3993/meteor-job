import './project-activity/project-activity';
import './project-info-layout/project-info-layout';
import './project-tasks-activity/project-task-activity';
import './project-time-tracker/project-time-tracker';
import './project-dashboard.html';

Template.projectDashboard.onCreated(function () {
    var self = this;
    this.currentTab = new ReactiveVar('projectTasksActivity');
    this.autorun(function () {
        var data = Template.currentData();
        var tab = data.tab;
        if (tab == 'tasks') {
            self.currentTab.set('projectTasksActivity');
        }
        if (tab == 'activity') {
            self.currentTab.set('projectActivity');
        }
        if (tab == 'tracker'){
            self.currentTab.set('projectTimeTracker');
        }
    });
});

Template.projectDashboard.onRendered(function () {
    this.$('ul.tabs').tabs();
});

Template.projectDashboard.helpers({
    tab: function () {
        return Template.instance().currentTab.get();
    },
    isTabSelected: function (tabName) {
        var currentTab = Template.instance().currentTab.get();
        return tabName == currentTab ? 'active' : '';
    }
});

Template.projectDashboard.events({
    'click .tabs-row li': function (e, tmpl) {
        var currentTab = $(e.target).closest('li');
        var templateName = currentTab.data('template');
        var params, query;
        var projectId = Router.current().params.id;

        tmpl.currentTab.set(templateName);
        if (templateName == 'projectTasksActivity') {
            params = {id: projectId, tab: 'tasks'};
            query = {query: {'tasks-type': 'assigned'}};
        }
        else if (templateName == 'projectActivity') {
            params = {id: projectId, tab: 'activity'};
            query = {};
        }
        else if (templateName == 'projectTimeTracker') {
            params = {id: projectId, tab: 'tracker'};
            query = {};
        }
        Router.go('projectDashboard', params, query);
    }
});