import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Tasks } from '/imports/api/tasks/tasks';
import './active-tasks.html';
import './dashboard-card-active';
import './users-active-tasks-list';
import { timeEntriesSubs } from '/imports/startup/client/subManagers';

Template.usersActiveTasks.onCreated(function () {
    var self = this;
    self.ready = new ReactiveVar(false);

    this.autorun(function () {
        var data = Template.currentData();
        if (data && data.userId) {
            var tasksArr = [];
            if (data.userTaskId) {
                var userTaskId = data && data.userTaskId;
                tasksArr.push(userTaskId);
            }
            if (data.lastTaskId) {
                var lastTaskId = data && data.lastTaskId;
                tasksArr.push(lastTaskId);
            }
            var subscribtion1 = timeEntriesSubs.subscribe('entriesByTaskIds', tasksArr);
            if(subscribtion1.ready()){
                self.ready.set(true);
            }
        }
        else if (data && data._id && data._id.$in) {
            var subscribtion2 = timeEntriesSubs.subscribe('entriesByTaskIds', data._id.$in);
            if(subscribtion2.ready()){
                self.ready.set(true);
            }
        }
        else if (data && data._id && !data._id.$in) {
            var taskIds = [data._id];
            var subscribtion3 = timeEntriesSubs.subscribe('entriesByTaskIds', taskIds);
            if(subscribtion3.ready()){
                self.ready.set(true);
            }
        }
    });
});

Template.usersActiveTasks.onRendered(function () {

});

Template.usersActiveTasks.helpers({
    taskItems: function () {
        var data = Template.instance().data;
        if (data.userId) {
            var userTasks = [];
            if (data.userTaskId) {
                var currentTask = Tasks.findOne({_id: data.userTaskId});
                currentTask.currentlyWorking = true;
                currentTask.workerId = data.userId;
                userTasks.push(currentTask);
            }
            if (data.lastTaskId) {
                var lastWorkedTask = Tasks.findOne({_id: data.lastTaskId});
                lastWorkedTask.lastWorked = true;
                lastWorkedTask.endDate = data.endDate;
                lastWorkedTask.workerId = data.userId;
                userTasks.push(lastWorkedTask);
            }
            return userTasks;
        }
        else if (data && data._id && data._id.$in && data.usersLastTimeEntriesTasks) {
            var allTasks = [];
            var tasks = Tasks.find({_id: data._id}).fetch();
            var timeEntries = TimeEntries.find({
                taskId: {$in: data._id.$in},
                _isActive: true
            }).fetch();
            _.each(tasks, function (task) {
                _.each(timeEntries, function (entry) {
                    var user = Meteor.users.findOne({_id: entry.userId});
                    if (task._id == entry.taskId && _.contains(task.membersIds, entry.userId) && user.profile.entryId == entry._id) {
                        task.trakingUserId = user._id;
                        allTasks.push(task);
                    }
                });
            });

            var lastTaskIds = _.map(data.usersLastTimeEntriesTasks, function (lastTask) {
                return lastTask.lastTaskId;
            });
            var lastTasks = Tasks.find({_id: {$in: lastTaskIds}}).fetch();

            _.each(lastTasks, function (latTaskN) {
                _.each(data.usersLastTimeEntriesTasks, function (userLastTask) {
                    if (latTaskN._id == userLastTask.lastTaskId) {
                        latTaskN.lastWorked = true;
                        latTaskN.endDate = userLastTask.entry.endDate;
                        latTaskN.workerId = userLastTask.userId;
                        allTasks.push(latTaskN);
                    }
                });
            });
            return allTasks;
        }
        else if (data && data._id && !data._id.$in) {
            var userTasks = [];
            var currentTask = Tasks.findOne({_id: data._id});
            if(currentTask){
                currentTask.currentlyWorking = true;
                currentTask.workerId = Meteor.userId();
                userTasks.push(currentTask);
            }
            return userTasks;
        }
    },
    emptyCardMessage: function () {
        return 'You have no worked on tasks';
    },
    dataLoadingMessage: function () {
        return 'Loading...';
    },
    ready: function () {
        return Template.instance().ready.get();
    }
});

Template.usersActiveTasks.events({});