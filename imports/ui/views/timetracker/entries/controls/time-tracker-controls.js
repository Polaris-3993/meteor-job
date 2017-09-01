import { VZ } from '/imports/startup/both/namespace';
import { Projects } from '/imports/api/projects/projects';
import './time-tracker-controls.html';
import './states/states';
import './tag-list-dropdown/tag-list-dropdown';

Template.timeTrackerControls.onCreated(function() {
    this.projectId = new ReactiveVar('');

    this.tagArray = new ReactiveArray();

    this.addingManualTime = new ReactiveVar(false);
});

Template.timeTrackerControls.helpers({
    isRunning: function () {
        return VZ.TimeTracker.instance.isRunning.get();
    },
    selectedProject: function () {
        var project = Projects.findOne(Template.instance().projectId.get());
        if (project && project.name)
            return project.name;
    },

    projectId: function () {
        var project = Projects.findOne(Template.instance().projectId.get());
        if (project)
            return project._id;
    },
    
    tagArray: function () {
        return Template.instance().tagArray;
    },

    addingManualTime: function () {
        return Template.instance().addingManualTime.get();
    },
    exitFromAddingManualTimeModeCb: function () {
        var tmpl = Template.instance();
        return function () {
            tmpl.addingManualTime.set(false);
        }
    },
    onReactiveVarSet: function () {
        var tmpl = Template.instance();
        return function (projectId) {
            tmpl.projectId.set(projectId);
        }
    }
});

Template.timeTrackerControls.events({
    'click .start-tracking-button': function (event, tmpl) {
        var message = tmpl.$('.time-entry-message').val();

        if (message.length < 2) {
            VZ.notify('The message is too short.', 3000);
            return;
        }

        if (message.length > 200) {
            VZ.notify('Not allowed more than 200 characters');
            return;
        }

        var $takeScreenshotsCheckbox = $('#take-screenshots-checkbox'),
            takeScreenshots = $takeScreenshotsCheckbox.prop('checked');
        var tags = tmpl.tagArray.array();

        try {
            VZ.TimeTracker.instance.startTracking(message, tmpl.projectId.get(), takeScreenshots, tags);
            tmpl.tagArray.clear();
        }
        catch (error) {
            console.error(error);
            VZ.notify(error.error);
        }
    },

    'click .time-tracker-stop-button': function () {
        VZ.TimeTracker.instance.stopTracking();
    },

    'click .select-project': function (event, tmpl) {
        var parentNode = $('body')[0],
            onProjectSelected = function (projectId) {
                console.log('selected projectId:', projectId);
                tmpl.projectId.set(projectId);
            },
            modalData = {
                onProjectSelected: onProjectSelected
            };

        Blaze.renderWithData(Template.timeTrackerProjectModalPicker, modalData, parentNode);
    },

    'click .add-manually-button': function (event, tmpl) {
        tmpl.addingManualTime.set(true);
    }
});
