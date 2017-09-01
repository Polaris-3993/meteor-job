import { VZ } from '/imports/startup/both/namespace';
import { Contracts } from '/imports/api/contracts/contracts';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import './worker-reports.html';

Template.workerTimeTrackerReports.onCreated(function () {
    var self = this;
    var dateRangeObj = {
        date: moment().toDate(),
        range: 'Weekly'
    };
    this.dateRange = new ReactiveVar(dateRangeObj);
    this.entriesLimit = new ReactiveVar(10);
    this.messageFilter = new ReactiveVar('');
    this.userId = new ReactiveVar(null);
    this.magic = new ReactiveVar(false);

    this.autorun(function () {
        var dateRange = self.dateRange.get();
        var messageFilter = self.messageFilter.get();
        var userId = self.userId.get();
        var companyId = Session.get('companyId');

        var workTimeSub = self.subscribe('userRangeWorkTimeCard', dateRange, [userId], companyId, messageFilter);
        var contractsSub = self.subscribe('ownerContracts', false, companyId);
        if(workTimeSub.ready() && contractsSub.ready()){
            self.magic.set(true);
        }
    });
    var timeSummary = function (tmpl) {
        var rangeObj = tmpl.dateRange.get();
        var userId = self.userId.get();

        var start = moment(rangeObj.date).startOf(VZ.dateRanges[rangeObj.range]).toDate();
        var end = moment(rangeObj.date).endOf(VZ.dateRanges[rangeObj.range]).toDate();

        var totalMiliSeconds = 0;
        userId = userId ? userId : null;
        TimeEntries.find({
            userId: userId,
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

Template.workerTimeTrackerReports.onRendered(function () {
    var self = this;
    this.autorun(function () {
        self.magic.get();
        var contracts = Contracts.find({employerId: Meteor.userId()}).fetch();
        var workerIds = _.map(contracts, function (contract) {
            return contract.workerId;
        });
        workerIds = _.uniq(workerIds);
        var users = Meteor.users.find({_id: {$in: workerIds}}).fetch();
        if(users.length > 0){
            setTimeout(function () {
                self.$('select').material_select();
            },300);
        }
    });
});

Template.workerTimeTrackerReports.onDestroyed(function () {
    clearInterval(this.updateTimerIntervalId);
});

Template.workerTimeTrackerReports.helpers({
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

    entries: function () {
        var userId = Template.instance().userId.get();
        var limit = Template.instance().entriesLimit.get();
        var dateRange = Template.instance().dateRange.get();
        var start = moment(dateRange.date).startOf(VZ.dateRanges[dateRange.range]).toDate();
        var end = moment(dateRange.date).endOf(VZ.dateRanges[dateRange.range]).toDate();
        return TimeEntries.find({
            _done: true,
            _isActive: false,
            userId:userId,
            startDate: {
                $gte: start,
                $lte: end
            }
        },{limit: limit, sort:{startDate: -1}});
    },

    isShowMoreBtn: function () {
        return Template.instance().entriesLimit.get() <= TimeEntries.find().count() - 1;
    },
    contractedUsers: function () {
        var contracts = Contracts.find({employerId: Meteor.userId()}).fetch();
        var workerIds = _.map(contracts, function (contract) {
            return contract.workerId;
        });
        workerIds = _.uniq(workerIds);
        var users = Meteor.users.find({_id: {$in: workerIds}}).fetch();
        return users;
    },
    userId: function () {
        return Template.instance().userId;
    }
});

Template.workerTimeTrackerReports.events({
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
    },
    'change #users-select': function (event, tmpl) {
        event.preventDefault();
        var userId = tmpl.$('#users-select option:selected').val();
        tmpl.userId.set(userId);
    }
});
