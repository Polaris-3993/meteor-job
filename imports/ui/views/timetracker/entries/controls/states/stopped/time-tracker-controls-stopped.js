import { Tasks } from '/imports/api/tasks/tasks';
import './time-tracker-controls-stopped.html';

Template.timeTrackerControlsStopped.onCreated(function () {
    var self = this;
    this.isTagPopupActive = new ReactiveVar(false);
    this.searchString = new ReactiveVar('');

    this.autorun(function () {
        var data = Template.currentData();
        self.subscribe('filterTasks', self.searchString.get());
    });
});

Template.timeTrackerControlsStopped.onRendered(function () {
});

Template.timeTrackerControlsStopped.helpers({
    isProjectSelected: function () {
        return !!Template.currentData().selectedProject;
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
            },
            archived: false,
            membersIds: Meteor.userId()
        });
    },
    isFilterActive: function () {
        var filter = Template.instance().searchString.get();
        return filter && filter.trim().length > 0
    }
});

Template.timeTrackerControlsStopped.events({
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
        tmpl.$('#time-entry-message').val(taskKey + ': ' + taskName);
        tmpl.data.onReactiveVarSet(projectId);

    }
});