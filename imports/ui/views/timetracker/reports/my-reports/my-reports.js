import { VZ } from '/imports/startup/both/namespace';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import './my-reports.html';

Template.myTimeTrackerReports.onCreated(function () {
    var self = this;
    var dateRangeObj = {
        date: moment().toDate(),
        range: 'Weekly'
    };
    this.dateRange = new ReactiveVar(dateRangeObj);
    this.entriesLimit = new ReactiveVar(10);

    //----------- filter vars -----------------
    this.tagFilter = new ReactiveArray();
    this.projectFilter = new ReactiveArray();
    this.messageFilter = new ReactiveVar();

    //------------ modal triggers --------------------
    this.isTagFilterActive = new ReactiveVar(false);
    this.isProjectFilterActive = new ReactiveVar(false);
    //------------------------------------------------

    this.autorun(function () {
        var dateRange = self.dateRange.get();
        var tagFilter = self.tagFilter.array();
        var projectFilter = self.projectFilter.array();
        var messageFilter = self.messageFilter.get();

        self.subscribe('rangeWorkTime', dateRange, tagFilter, projectFilter, messageFilter);
    });

    var timeSummary = function (tmpl) {
        var rangeObj = tmpl.dateRange.get();
        var start = moment(rangeObj.date).startOf(VZ.dateRanges[rangeObj.range]).toDate();
        var end = moment(rangeObj.date).endOf(VZ.dateRanges[rangeObj.range]).toDate();

        var totalMiliSeconds = 0;
        TimeEntries.find({
            userId: Meteor.userId(),
            startDate: {
                $gte: start,
                $lte: end
            }
        }).forEach(function (entry) {
            var diff = moment(entry.endDate).diff(entry.startDate);
            totalMiliSeconds += diff;
        });

        var hours = parseInt(moment.duration(totalMiliSeconds).asHours());
        hours = hours < 10 ? '0' + hours : hours;
        return hours + moment.utc(totalMiliSeconds).format(':mm:ss')
    };
    this.timeWorked = new ReactiveVar(timeSummary(this));
    this.updateTimerIntervalId = setInterval(function () {
        self.timeWorked.set(timeSummary(self));
    }, 1000);
});

Template.myTimeTrackerReports.onRendered(function () {
    VZ.UI.dropdown('.vz-dropdown');
    VZ.UI.select('.vz-select');
});

Template.myTimeTrackerReports.onDestroyed(function () {
    clearInterval(this.updateTimerIntervalId);
});

Template.myTimeTrackerReports.helpers({
    timeWorked: function () {
        return Template.instance().timeWorked.get();
    },

    dateRange: function () {
        return Template.instance().dateRange;
    },

    pickerRange: function () {
        var dateRange = Template.instance().dateRange.get();
        var start = moment(dateRange.date).startOf(VZ.dateRanges[dateRange.range]).format('Do MMM YYYY');
        var end = moment(dateRange.date).endOf(VZ.dateRanges[dateRange.range]).format('Do MMM YYYY');

        return start + ' - ' + end;
    },

    isTagFilterActive: function () {
        return Template.instance().isTagFilterActive.get();
    },

    isProjectFilterActive: function () {
        return Template.instance().isProjectFilterActive.get();
    },

    projectFilterControls: function () {
        return {
            isPopupActive: Template.instance().isProjectFilterActive,
            filter: Template.instance().projectFilter,
            label: 'Project',
            collection: 'Projects',
            subscription: 'filterProjects'
        }
    },

    tagFilterControls: function () {
        return {
            isPopupActive: Template.instance().isTagFilterActive,
            filter: Template.instance().tagFilter,
            label: 'Tags',
            collection: 'EntryTags',
            subscription: 'tags'
        }
    },

    entries: function () {
        var limit = Template.instance().entriesLimit.get();
        var dateRange = Template.instance().dateRange.get();
        var start = moment(dateRange.date).startOf(VZ.dateRanges[dateRange.range]).toDate();
        var end = moment(dateRange.date).endOf(VZ.dateRanges[dateRange.range]).toDate();

        var entries = TimeEntries.find({
            _done: true,
            _isActive: false,
            userId: Meteor.userId(),
            startDate: {
                $gte: start,
                $lte: end
            }

        },{limit: limit, sort:{startDate: -1}});

        return entries;
    },

    isShowMoreBtn: function () {
        return Template.instance().entriesLimit.get() <= TimeEntries.find().count() - 1;
    }
});

Template.myTimeTrackerReports.events({
    'change .dateRange-select': function (event, tmpl) {
        var range = tmpl.$(event.currentTarget).val();

        if (range) {
            var dateRange = tmpl.dateRange.get();
            dateRange.range = range;
            tmpl.dateRange.set(dateRange);
        }
    },

    'click .pick-prev-range': function (event, tmpl) {
        var dateRange = tmpl.dateRange.get();
        var range = VZ.dateRanges[dateRange.range];
        if (range === 'isoweek') {
            range = 'week'
        }
        dateRange.date = moment(dateRange.date).subtract(1, range).toDate();
        tmpl.dateRange.set(dateRange);
    },

    'click .pick-next-range': function (event, tmpl) {
        var dateRange = tmpl.dateRange.get();
        var range = VZ.dateRanges[dateRange.range];
        if (range === 'isoweek') {
            range = 'week'
        }
        dateRange.date = moment(dateRange.date).add(1, range).toDate();
        tmpl.dateRange.set(dateRange);
    },

    'click .project-filter': function (e, tmpl) {
        tmpl.isProjectFilterActive.set(true);
    },

    'click .tag-filter': function (e, tmpl) {
        tmpl.isTagFilterActive.set(true);
    },

    'input #messageFilter': function (e, tmpl) {
        var msg = $(e.currentTarget).val();
        tmpl.messageFilter.set(msg)
    },

    'click .show-more-entries-btn': function (e, tmpl) {
        tmpl.entriesLimit.set(tmpl.entriesLimit.get() + 10)
    }
});
