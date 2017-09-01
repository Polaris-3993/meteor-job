import { VZ } from '/imports/startup/both/namespace';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Projects } from '/imports/api/projects/projects';

import './time-tracker-controls-running.html';

Template.timeTrackerControlsRunning.onCreated(function () {
    var activeTimeEntry = TimeEntries.findOne({_isActive: true});
    if (activeTimeEntry && activeTimeEntry.projectId) {
        var activeEntryProject = Projects.findOne({_id: activeTimeEntry.projectId});
        this.projectName = activeEntryProject.name;
    }
});

Template.timeTrackerControlsRunning.onRendered(function () {
    this.autorun(function () {
        var activeTimeEntry = TimeEntries.findOne({_isActive: true});
        if (activeTimeEntry) {
            var timeEntryMessage = activeTimeEntry.message;
            $('#time-entry-message').val(timeEntryMessage);
            console.log('Found active entry. Setting value for input field: "' + timeEntryMessage + '"');
        }
    });
});

Template.timeTrackerControlsRunning.helpers({

    timeElapsed: function () {
        if (VZ.TimeTracker.instance.isRunning.get()) {
            var secondsElapsed = VZ.TimeTracker.instance.timeElapsed.get(),
                millisec = secondsElapsed * 1000;
            var hours = parseInt(moment.duration(millisec).asHours());
            if (hours < 10) {
                hours = '0' + hours;
            }
            return hours + moment.utc(millisec).format(':mm:ss');
        }
        else
            return '00:00:00';
    },

    selectedProject: function () {
        return Template.instance().projectName;
    },

    hasProject: function () {
        return !!Template.instance().projectName;
    },

    messageInputWidth: function () {
        if (Template.instance().projectName) {
            return 's8'
        }
        else
            return 's10'
    }

});