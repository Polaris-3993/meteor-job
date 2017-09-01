import { VZ } from '/imports/startup/both/namespace';
import { Screenshots } from '/imports/api/screenShots/screenShots';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';


import './project-time-entries.html';
import { timeEntriesSubs } from '/imports/startup/client/subManagers';

Template.prjectTimeEntries.onCreated(function () {
    var self = this;

    var DEFAULT_LIMIT = 10;

    this.listView = new ReactiveVar('day');
    this.entriesLimit = new ReactiveVar(DEFAULT_LIMIT);
    this.filterString = new ReactiveVar('');

    self.autorun(function () {
        var data = Template.currentData();
        var filterParams = data.filterParams;
        var projectId = data.project && data.project._id;
        var filterString  = self.filterString.get();
        if(filterString.length > 0){
            filterParams.message = {
                $regex: filterString, $options: 'gi'
            };
        }
        var options = {
            limit: self.entriesLimit.get() + 1,
            sort: {startDate: -1}
        };
        filterParams.projectId = projectId;
        timeEntriesSubs.subscribe('timeEntriesAndScreenshots', filterParams, options);
    });

    self.autorun(function () {
        Template.currentData();
        self.entriesLimit.set(DEFAULT_LIMIT);
    });
});

Template.prjectTimeEntries.onRendered(function () {
    var self = this;
    this.$('select').material_select();

    this.autorun(function () {
        var data = Template.currentData();
        var projectId = data.project && data.project._id;
        var limit = self.entriesLimit.get();
        var query = {_isActive: false, projectId: projectId, userId: Meteor.userId()};
        var filterString  = self.filterString.get();
        if(filterString.length > 0){
            query.message = {
                $regex: filterString, $options: 'gi'
            };
        }
        var timeEntries = TimeEntries.find(query, {
                sort: {startDate: -1},
                limit: limit
            }).fetch();
        if(timeEntries.length > 0){
        setTimeout(function () {
            self.$('.collapsible').collapsible();
        },300);
        }
    });
});

Template.prjectTimeEntries.helpers({
    hasEntries: function () {
        var tmpl = Template.instance();
        var filterString = tmpl.filterString.get();
        var projectId = tmpl.data && tmpl.data.project && tmpl.data.project._id;
        var query = {_isActive: false, projectId: projectId, userId: Meteor.userId()};

        if(filterString.length > 0){
            query.message = {
                $regex: filterString, $options: 'gi'
            };
        }

        return !!TimeEntries.findOne(query);
    },
    timeEntriesGroups: function () {
        var tmpl = Template.instance();
        var limit = tmpl.entriesLimit.get();
        var filterString = tmpl.filterString.get();
        var projectId = tmpl.data && tmpl.data.project && tmpl.data.project._id;
        var query = {_isActive: false, projectId: projectId, userId: Meteor.userId()};
        if(filterString.length > 0){
            query.message = {
                $regex: filterString, $options: 'gi'
            };
        }
        var timeEntries = TimeEntries.find(query, {
                sort: {startDate: -1},
                limit: limit
            }).fetch();
        var listView = Template.instance().listView.get();
        var groupBy = '';
        if (listView == 'day') {
            groupBy = 'DD MMMM, YYYY';
        }
        else if (listView == 'week') {
            groupBy = 'MMMM, YYYY';
        }
        else if (listView == 'month') {
            groupBy = 'MMMM, YYYY';
        }
        else if (listView == 'year') {
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
    taskNameKey: function () {
        var message = this.message;
        var index = message.indexOf(':');
        if(index != -1){
            return {
               name:  message.split(':')[1],
                key: message.split(':')[0]
            }
        }
        else {
            return {
                name: message,
                key: '-'
            }
        }
    },
    entryTimeTracked: function () {
        var startDate = this.startDate;
        var endDate = this.endDate;

        return moment(endDate).diff(startDate, 'second');
    },
    shouldShowLoadMoreButton: function () {
        var limit = Template.instance().entriesLimit.get();
        var foundedEntriesCount = TimeEntries.find().count();
        return limit <= foundedEntriesCount - 1;
    },
    screenShotsCount: function () {
        var timeEntryId = this._id;
        return Screenshots.find({timeEntryId: timeEntryId}).count();
    },
    totalEarned: function () {
        var startDate = this.startDate;
        var endDate = this.endDate;
        if(this.paymentType && this.paymentType === 'hourly'){
            var oneHour = 1000 * 60 * 60;
            var rate = this.paymentRate;
            var duration = endDate - startDate;
            var totalEarned = duration * rate / oneHour;
            totalEarned = totalEarned.toFixed(2);
            return '$' + totalEarned + ' earned';
        }
        else {
            return 0;
        }
    }
});

Template.prjectTimeEntries.events({
    'change #view-select': function (event, tmpl) {
        var view = tmpl.$(event.currentTarget).val();

        //Warning : Materialize BS, for some reason I get a second event setting, right after the first change.
        // the value obtained is null so we need to check if we actually have something.
        if (view) {
            tmpl.listView.set(view);
        }
    },
    'input #filter-tasks': function (event, tmpl) {
        event.preventDefault();
        var searchString = tmpl.$('#filter-tasks').val();
        tmpl.filterString.set(searchString);
    },
    'click #time-tracker-show-more': function (event, tmpl) {
        var limit = tmpl.entriesLimit.get();
        tmpl.entriesLimit.set(limit + 5);
    },
    'click #delete-time-entry': function (event, tmpl) {
        var timeEntryId = this._id;
        Meteor.call('removeTimeEntry', timeEntryId, function (error, result) {
            if(error){
                VZ.notify(error.message);
            }
        });
    }
});