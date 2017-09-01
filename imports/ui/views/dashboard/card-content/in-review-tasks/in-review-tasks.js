import { VZ } from '/imports/startup/both/namespace';
import { timeEntriesSubs } from '/imports/startup/client/subManagers';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Tasks } from '/imports/api/tasks/tasks';
import { Projects } from '/imports/api/projects/projects';
import './in-review-tasks.html';
import './dashboard-in-review-tasks';
import './in-review-task-list';

Template.usersInReviewTasks.onCreated(function () {
    var self = this;
    self.ready = new ReactiveVar(false);

    this.autorun(function () {
        Template.currentData();
        var companyId = Session.get('companyId');
        var sub = timeEntriesSubs.subscribe('dashboardInReviewCard', companyId);
        if(sub.ready()){
            self.ready.set(true);
        }
    });
    this.getTaskEarnings = function (taskId) {
        var oneHour = 1000 * 60 * 60;
        var totalSpent = 0;
        var timeEntries = TimeEntries.find({taskId: taskId, _isActive: false}).fetch();
        timeEntries = _.filter(timeEntries, function (entry) {
            return _.has(entry, 'contractId');
        });
        _.each(timeEntries, function (entry) {
            var timeEntryDuration = entry.endDate - entry.startDate;
            var earned = timeEntryDuration * entry.paymentRate / oneHour;
            totalSpent += earned;
        });
        totalSpent = totalSpent.toFixed(2);
        return totalSpent;
    };
    this.getTaskTimeSpent = function (task) {
            var timeTracked = 0;
            var entryName = task.taskKey + ': ' + task.name;
            var taskId = task._id;
            var projectId = task.projectId;
            var entries = TimeEntries.find({
                projectId: projectId,
                $or: [{taskId: taskId}, {message: entryName}]
            }).fetch();
            _.each(entries, function (entry) {
                timeTracked += moment(entry.endDate).diff(entry.startDate, 'second');
            });
            return timeTracked;
    };
});

Template.usersInReviewTasks.onRendered(function () {

});

Template.usersInReviewTasks.helpers({
    taskItems: function () {
        var tmpl = Template.instance();
        var data = tmpl.data;
        var projects = Projects.find({ownerId: Meteor.userId()}).fetch();
        var projectsIds = _.map(projects, function (project) {
            return project._id;
        });
        if (data == 'name') {
            return Tasks.find({projectId: {$in: projectsIds}, status: 'In-review'}, {$sort: {name: -1}}).fetch();
        }
        else if (data == 'time') {
            var tasksByTime = Tasks.find({
                projectId: {$in: projectsIds},
                status: 'In-review'
            }).fetch();

            _.each(tasksByTime, function (task) {
                var timeSpent = tmpl.getTaskTimeSpent(task);
                task.timeSpent = timeSpent;
            });
            tasksByTime = _.sortBy(tasksByTime, 'timeSpent');
            return tasksByTime;
        }
        else if (data == 'earnings') {
            var tasksByEarnings = Tasks.find({
                projectId: {$in: projectsIds},
                status: 'In-review'
            }).fetch();

            _.each(tasksByEarnings, function (task) {
                var taskEarnings = tmpl.getTaskEarnings(task._id);
                task.taskEarnings = taskEarnings;
            });
            tasksByEarnings = _.sortBy(tasksByEarnings, 'taskEarnings');
            return tasksByEarnings;
        }
        else {
            return [];
        }
    },
    emptyCardMessage: function () {
        return 'You have no tasks in review';
    },
    dataLoadingMessage: function () {
        return 'Loading...';
    },
    ready: function () {
        return Template.instance().ready.get();
    }
});

Template.usersInReviewTasks.events({
    'click #approve': function (event, tmpl) {
        event.preventDefault();
        var taskId = this._id;
        Meteor.call('changeTaskStatus', taskId, 'Closed', function (error, result) {
            if (!error) {
                console.log('updated');
            }
            else {
                VZ.notify(error.message);
            }
        });
    },
    'click #deny': function (event, tmpl) {
        event.preventDefault();
        var taskId = this._id;
        Meteor.call('changeTaskStatus', taskId, 'Opened', function (error, result) {
            if (!error) {
                console.log('updated');
            }
            else {
                VZ.notify(error.message);
            }
        });
    },
    'click #task-name, click #task-key': function (event, tmpl) {
        event.preventDefault();
        var taskId = this._id;
        var projectId = this.projectId;
        Router.go('projectDashboard', {id: projectId, tab: 'tasks'}, {query: {tasks: 'in-review', task: taskId}});
    }
});