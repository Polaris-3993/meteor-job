import { TimeEntries } from '/imports/api/timeEntries/timeEntries';

import './create-edit-task/create-edit-task';
import './data-table-actions/data-table-actions';
import './task-view/task-view';
import './tasks-list/tasks-list';
import './time-tracked.html';

Template.timeTracked.onCreated(function () {
    var self = this;

    this.autorun(function () {
        self.subscribe('timeEntries');
    });
});

Template.timeTracked.helpers({
    time: function () {
        var timeTracked = 0;
        var entryName = this.taskKey + ': ' + this.name;
        var projectId = this.projectId;
        var entries = TimeEntries.find({
            projectId: projectId,
            message: entryName
        }).fetch();
        _.each(entries, function (entry) {
            timeTracked += moment(entry.endDate).diff(entry.startDate, 'second');
        });
        return timeTracked;
    }
});