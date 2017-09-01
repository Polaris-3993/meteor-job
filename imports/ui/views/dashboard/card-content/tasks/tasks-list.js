import { Tasks } from '/imports/api/tasks/tasks';
import './tasks-list.html';
import './task-item';
import './completed-tasks/completed-tasks';
import { timeEntriesSubs } from '/imports/startup/client/subManagers';

Template.dashboardTasksList.onCreated(function () {
    var self = this;
    self.ready = new ReactiveVar(false);
    self.autorun(function () {
       var data = Template.currentData();
        var sub = timeEntriesSubs.subscribe('timeEntriesForUserTasks', data);
        if(sub.ready()){
            self.ready.set(true);
        }
    });
});

Template.dashboardTasksList.onRendered(function () {
});

Template.dashboardTasksList.helpers({
    taskItems: function () {

        var tmpl = Template.instance();
        var ready = tmpl.ready.get();
        if(ready){
            var data = tmpl.data;
            return Tasks.find(data).fetch();
        }
        else {
            return [];
        }
    },
    emptyCardMessage: function () {
        return 'You have no assigned tasks';
    },
    dataLoadingMessage: function () {
        return 'Loading...';
    },
    ready: function () {
        return Template.instance().ready.get();
    }
});

Template.dashboardTasksList.events({
});