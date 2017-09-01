import './group/time-tracker-time-entry-group';
import './project-picker/time-tracker-modal-proj';
import './view-select/view-select';
import './time-entries.html';

import { VZ } from '/imports/startup/both/namespace';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';

Template.timeEntries.onCreated(function () {
    var self = this;

    var DEFAULT_LIMIT = 10;

    self.listView = new ReactiveVar('day');
    self.entriesLimit = new ReactiveVar(DEFAULT_LIMIT);
    self.isCheckboxChecked = new ReactiveVar(false);

    self.checkedTimeEntries = new ReactiveArray([]);

    // update subscription if filter or limit changes
    self.autorun(function () {
        var query = Template.currentData().filterParams;
        var options = {
            limit: self.entriesLimit.get() + 1,
            sort: {startDate: -1}
        };
        self.subscribe('timeEntries', query, options);
    });

    // reset limit when filter was changed
    self.autorun(function () {
        Template.currentData();
        self.entriesLimit.set(DEFAULT_LIMIT);
    });
});

Template.timeEntries.onRendered(function () {
});

Template.timeEntries.helpers({
    hasEntries: function () {
        return !!TimeEntries.findOne({_isActive: false});
    },

    timeEntriesGroups: function () {
        var limit = Template.instance().entriesLimit.get();
        var timeEntries = TimeEntries.find({_isActive: false}, {
                sort: {startDate: -1},
                limit: limit
            }).fetch();

        var listView = Template.instance().listView.get();
        var groupBy = '';
        if (listView == 'day') {
            groupBy = 'DD MMMM, YYYY';
        } else if (listView == 'month') {
            groupBy = 'MMMM, YYYY';
        } else if (listView == 'year') {
            groupBy = 'YYYY';
        }
        var timeEntriesGroupsObj = _.groupBy(timeEntries, function (timeEntry) {
            return moment(timeEntry.startDate).format(groupBy);
        });

        var timeEntriesGroups = _.map(timeEntriesGroupsObj, function (value, key) {
            return {
                label: key, timeEntries: value
            }
        });

        if (listView == 'year') {
            timeEntriesGroups = timeEntriesGroups.reverse();
        }

        return timeEntriesGroups;
    },

    shouldShowLoadMoreButton: function () {
        var limit = Template.instance().entriesLimit.get();
        var foundedEntriesCount = TimeEntries.find().count();
        return limit <= foundedEntriesCount - 1;
    },

    shouldShowDeleteButton: function () {
        return Template.instance().isCheckboxChecked.get();
    }
});

Template.timeEntries.events({
    'change .view-select': function (event, tmpl) {
        var view = tmpl.$(event.currentTarget).val();

        //Warning : Materialize BS, for some reason I get a second event setting, right after the first change.
        // the value obtained is null so we need to check if we actually have something.
        if (view) {
            tmpl.listView.set(view);
        }
    },

    'click .time-tracker-show-more': function (event, tmpl) {
        var limit = tmpl.entriesLimit.get();
        tmpl.entriesLimit.set(limit + 5);
    },

    'click .delete-selected-group': function (event, tmpl) {
        var checkboxes = tmpl.$('.time-entry-checkbox:checked');

        var ids = _.map(checkboxes, function (checkbox) {
            return checkbox.id;
        });

        tmpl.$('.time-entry-group-checkbox').prop('checked', false);
        Meteor.call('deleteTimeEntryGroup', ids, function (err) {
            if (err) {
                VZ.notify('Failed to delete entries');
            } else {
                VZ.notify('Entires deleted');
                tmpl.isCheckboxChecked.set(false);
            }
        })
    },

    // .time-entry-checkbox exist in timeTrackerTimeEntry template
    'click .time-entry-checkbox, click .time-entry-group-checkbox': function (event, tmpl) {
        if (tmpl.$('.time-entry-checkbox:checked').length === 0) {
            tmpl.isCheckboxChecked.set(false);
        } else {
            tmpl.isCheckboxChecked.set(true);
        }
    }
});