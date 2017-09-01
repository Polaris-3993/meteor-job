import { VZ } from '/imports/startup/both/namespace';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Tasks } from '/imports/api/tasks/tasks';

import './project-time-entries/project-time-entries';
import './project-time-tracker.html';
import { tasksSubs } from '/imports/startup/client/subManagers';

Template.projectTimeTracker.onCreated(function () {
    var self = this;
    this.searchString = new ReactiveVar('');
    this.autorun(function () {
        var data = Template.currentData();
        var projectId = data.project && data.project._id;
        var searchString = self.searchString.get();
        tasksSubs.subscribe('filterTasks', searchString, projectId);
    });
});

Template.projectTimeTracker.onRendered(function () {
    var self = this;
    this.autorun(function () {
        self.$('#time-entry-message').val('');
        if (VZ.TimeTracker.instance.isRunning.get()) {
            var data = Template.currentData();
            var projectId = data.project._id;
            var activeTimeEntry = TimeEntries.findOne({
                _isActive: true,
                projectId: projectId,
                userId: Meteor.userId()
            });
            if (activeTimeEntry && activeTimeEntry.projectId == projectId) {
                var timeEntryMessage = activeTimeEntry.message;
                self.$('#time-entry-message').val(timeEntryMessage);
                console.log('Found active entry. Setting value for input field: "' + timeEntryMessage + '"');
            }
        }
    });
});

Template.projectTimeTracker.helpers({
    timeEntriesFilterParams: function () {
        return {};
    },
    canEditProject: function () {
        var projectId = this.project && this.project._id;
        return VZ.canUser('editProject', Meteor.userId(), projectId);
    },
    tasks: function () {
        var tmpl = Template.instance();
        var searchString = tmpl.searchString.get();
        var projectId = tmpl.data && tmpl.data.project && tmpl.data.project._id;
        var tasks = Tasks.find({
            taskKey: {
                $regex: searchString, $options: 'gi'
            },
            projectId: projectId,
            archived: false,
            membersIds: Meteor.userId()
        }).fetch();
        return tasks;
    },
    isFilterActive: function () {
        return Template.instance().searchString.get().length > 0;
    },
    isRunning: function () {
        var tmpl = Template.instance();
        var projectId = tmpl.data && tmpl.data.project && tmpl.data.project._id;
        var activeTimeEntry = TimeEntries.findOne({_isActive: true});

        return VZ.TimeTracker.instance.isRunning.get() && projectId == activeTimeEntry.projectId;
    },
    timeElapsed: function () {
        if (VZ.TimeTracker.instance.isRunning.get()) {
            var secondsElapsed = VZ.TimeTracker.instance.timeElapsed.get(),
                millisec = secondsElapsed * 1000;
            var hours = parseInt(moment.duration(millisec).asHours());
            if (hours < 10) {
                hours = "0" + hours;
            }
            return hours + moment.utc(millisec).format(":mm:ss")
        }
        else
            return "00:00:00";
    }
});

Template.projectTimeTracker.events({
    'mousedown #search-history-item': function (event, tmpl) {
        // console.log(this);
        var taskKey = this.taskKey;
        var taskName = this.name;
        tmpl.$('#time-entry-message').val(taskKey + ': ' + taskName);
        tmpl.searchString.set('');
    },
    'input #time-entry-message': function (event, tmpl) {
        event.preventDefault();
        var searchString = tmpl.$('#time-entry-message').val();
        tmpl.searchString.set(searchString);
    },
    'click #start-tracking': function (event, tmpl) {
        var message = tmpl.$('#time-entry-message').val();

        if (message.length < 2) {
            VZ.notify('The message is too short.', 3000);
            return;
        }

        if (message.length > 200) {
            VZ.notify('Not allowed more than 200 characters');
            return;
        }

        try {
            VZ.TimeTracker.instance.startTracking(message, tmpl.data.project._id, false, []);
        }
        catch (error) {
            console.error(error);
            VZ.notify(error.error);
        }
    },
    'click #stop-tracking': function (event, tmpl) {
        event.preventDefault();
        VZ.TimeTracker.instance.stopTracking();
        tmpl.$('#time-entry-message').val('');
    }
});