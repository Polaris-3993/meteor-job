import { VZ } from '/imports/startup/both/namespace';
import { Tasks } from '/imports/api/tasks/tasks';
import { Projects } from '/imports/api/projects/projects';
import './manual-time.html';

Template.timeTrackerManualTime.onCreated(function () {
    var self = this;
    this.startTime = new ReactiveVar();
    this.endTime = new ReactiveVar();
    this.isTagPopupActive = new ReactiveVar(false);
    this.searchString = new ReactiveVar('');

    this.autorun(function () {
        var data = Template.currentData();
        self.subscribe('filterTasks', self.searchString.get());
    });
});

Template.timeTrackerManualTime.helpers({
    isProjectSelected: function () {
        return !!Template.currentData().selectedProject;
    },

    selectedProject: function () {
        return Projects.findOne({_id: Template.currentData().selectedProject}).name;
    },

    duration: function () {
        var startTime = Template.instance().startTime.get();
        var endTime = Template.instance().endTime.get();
        if (startTime && endTime) {
            var duration = moment(endTime).diff(startTime), //milliseconds
                hours = parseInt(moment.duration(duration).asHours());
            if (hours < 10) {
                hours = '0' + hours;
            }
            return hours + moment.utc(duration).format(':mm:ss');
        } else {
            return '00:00:00'
        }

    },

    isTagPopupActive: function () {
        return Template.instance().isTagPopupActive.get();
    },

    tagPopupControls: function () {
        return {
            tagArray: this.tagArray,
            isTagPopupActive: Template.instance().isTagPopupActive
        }
    },
    tasks: function () {
        var searchString = Template.instance().searchString.get();
        return Tasks.find({
            taskKey: {
                $regex: searchString
            }
        });
    },
    isFilterActive: function () {
        var filter = Template.instance().searchString.get();
        return filter && filter.trim().length > 0
    }
});

Template.timeTrackerManualTime.events({
    'input .manual-time-input': function (event, tmpl) {
        var start = moment(tmpl.$('#startManualTime').val(), 'DD/MM/YYYY HH:mm:ss');
        var end = moment(tmpl.$('#endManualTime').val(), 'DD/MM/YYYY HH:mm:ss');

        if (start.isValid() && end.isValid()) {
            tmpl.startTime.set(start);
            tmpl.endTime.set(end);
        } else {
            tmpl.startTime.set();
            tmpl.endTime.set();
        }

    },

    'click .save-manual-button': function (event, tmpl) {
        var message = tmpl.$('.time-entry-message').val();

        if (message.length < 2) {
            VZ.notify('The message is too short.', 3000);
            return;
        }

        if (message.length > 50) {
            VZ.notify('Not allowed more than 50 characters');
            return;
        }
        // 15/01/2016 15:00:00
        // console.log(tmpl.data, tmpl.startTime.get(), tmpl.endTime.get());
        // console.log(tmpl.data.selectedProject);
        if (tmpl.startTime.get() && tmpl.endTime.get()) {
            var duration = moment.duration(tmpl.endTime.get().diff(tmpl.startTime.get()));
            var minutes = duration.asMinutes();
            if (minutes <= 0) {
                VZ.notify('Time entry must be more that 0');
                return;
            }
            Meteor.call('addManualTime', {
                startDate: tmpl.startTime.get().toDate(),
                endDate: tmpl.endTime.get().toDate(),
                minutes: minutes,
                message: message,
                projectId: tmpl.data.selectedProject,
                tags: tmpl.data.tagArray.array()
            }, function (err, res) {
                if (err) {
                    VZ.notify('Failed to add manual time');
                    console.error(err)
                } else {
                    tmpl.data.tagArray.clear();
                    tmpl.data.closeManualTimeMode();
                    VZ.notify('Manual time added');
                }
            })
        }
    },

    'click .cancel-manual-button': function (event, tmpl) {
        tmpl.data.closeManualTimeMode();
    },

    'click .tag-icon': function (event, tmpl) {
        tmpl.isTagPopupActive.set(!tmpl.isTagPopupActive.get());
    },
    'input .time-entry-message': function (event, tmpl) {
        event.preventDefault();
        var searchString = tmpl.$('.time-entry-message').val();
        tmpl.searchString.set(searchString);
    },
    'mousedown .search-history-item': function (event, tmpl) {
        var taskKey = this.taskKey;
        var taskName = this.name;
        var projectId = this.projectId;
        tmpl.$('#time-entry-message').val(taskKey+': '+ taskName);
        tmpl.data.onReactiveVarSet(projectId);

    }
});