import { VZ } from '/imports/startup/both/namespace';
import './workers-screenshots.html';
import { timeEntriesSubs } from '/imports/startup/client/subManagers';

import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Contracts } from  '/imports/api/contracts/contracts';
import { Screenshots } from '/imports/api/screenShots/screenShots';
Template.workersScreenshots.onCreated(function () {
    this.searchQuery1 = new ReactiveVar({userId: Meteor.userId()});
    this.timeFormat = new ReactiveVar('');
    this.datePickerDate = new ReactiveVar('');
    this.isReady = new ReactiveVar(false);
    this.screens = new ReactiveVar([]);

    var self = this;
    this.getGreenWitchTime = function (date) {
        return moment(date.getTime() + (date.getTimezoneOffset() * 60000));
    };
    this.getTimeZoneName = function (timeZone) {
        var utc;
        var ownUtc = moment.tz.guess();
        switch (timeZone) {
            case 'current':
                utc = ownUtc;
                break;
            case 'utc':
                utc = 'Etc/Greenwich';
                break;
            case 'gmt':
                utc = 'Etc/GMT';
                break;
            case 'est':
                utc = 'EST';
                break;
            default:
                return false;
        }
        return utc;
    };
    this.getTimePeriod = function (takenAt) {
        var timeFormat = self.timeFormat.get() || '24';
        var minutes = moment(takenAt).get('minute');

        var momentTimeFormat;
        if (timeFormat == '12') {
            momentTimeFormat = 'hh';

        } else if (timeFormat == '24') {
            momentTimeFormat = 'HH';
        }
        var hours = moment(takenAt).get('hour');
        var hoursFormated = moment(hours, 'HH').format(momentTimeFormat);
        if(timeFormat == '12'){
            hoursFormated = parseInt(hoursFormated);
        }
        var period, hoursFormatedLast;

        if (minutes >= 0 && minutes < 10) {
            period = hoursFormated + ':' + '00' + ' - ' + hoursFormated + ':' + '10';
        }
        else if (minutes >= 10 && minutes < 20) {
            period = hoursFormated + ':' + '10' + ' - ' + hoursFormated + ':' + '20';
        }
        else if (minutes >= 20 && minutes < 30) {
            period = hoursFormated + ':' + '20' + ' - ' + hoursFormated + ':' + '30';
        }
        else if (minutes >= 30 && minutes < 40) {
            period = hoursFormated + ':' + '30' + ' - ' + hoursFormated + ':' + '40';
        }
        else if (minutes >= 40 && minutes < 50) {
            period = hoursFormated + ':' + '40' + ' - ' + hoursFormated + ':' + '50';
        }
        else if (minutes >= 50 && minutes < 60) {
            hoursFormatedLast = moment(parseInt(hoursFormated), 'hh').add(1, 'h').format(momentTimeFormat);
            period = hoursFormated + ':' + '50' + ' - ' + hoursFormatedLast + ':' + '00';
        }
        else {
            period = false;
        }
        return period;
    };
    this.getDayStartEndTime = function () {
        var dayToShowScreenshots = self.data.dayToShowScreenshots.concat(' 00:00');
        var timeZone = self.data.timeZone;
        var timeZoneName = self.getTimeZoneName(timeZone);

        var startOfDay = moment.tz(dayToShowScreenshots, timeZoneName).startOf('day').toDate();
        var endOfDay = moment.tz(dayToShowScreenshots, timeZoneName).endOf('day').toDate();

        return {
            startOfDay: startOfDay,
            endOfDay: endOfDay
        }
    };


    this.changeDay = function (day) {
        var date;
        var $input = self.$('.datepicker').pickadate();
        var picker = $input.pickadate('picker');
        var dayToShowScreenshots = self.data.dayToShowScreenshots.replace(/-/g, '/');
        var today = new Date(dayToShowScreenshots);
        var timeZone = self.data.timeZone;
        var query = {};
        switch (day) {
            case 'yeasterday':
                date = new Date(today.setDate(today.getDate() - 1));
                break;
            case 'tomorrow':
                date = new Date(today.setDate(today.getDate() + 1));
                break;
            default:
                return false;
        }
        self.datePickerDate.set(date);
        picker.set('select', date, {format: 'd mmmm, yyyy'});
        var screenshotsDate = moment(date).format('YYYY-MM-DD');
        Router.go('screenshots', {screenshotsDate: screenshotsDate, timeZone: timeZone}, {query: query});
    };
    this.getScreenshotsTimeFormat = function (timeFormat) {
        return timeFormat == '12' ? 'h a' : 'HH';
    };
    this.autorun(function () {
        var dayStartEndTime = self.getDayStartEndTime();
        var searchQuery = _.clone(self.searchQuery1.get());
        var companyId = Session.get('companyId');
        var contractsSub = self.subscribe('ownerContracts', true, companyId);
        var timeEntriesSub = timeEntriesSubs.subscribe('timeEntriesAndScreenshotsWorker', searchQuery, companyId);
        if(contractsSub.ready() && timeEntriesSub.ready()){
            self.isReady.set(true);
            var timeEntries = TimeEntries.find(searchQuery, {sort: {startDate: 1}});
            var timeEntriesIds = timeEntries.map(function (timeEntry) {
                return timeEntry._id;
            });
            var screenshots = Screenshots.find({
                timeEntryId: {$in: timeEntriesIds},
                takenAt: {
                    $gte: dayStartEndTime.startOfDay,
                    $lte: dayStartEndTime.endOfDay
                }
            }, {sort: {takenAt: 1}}).fetch();
            self.screens.set(screenshots);
        }
    });
});
Template.workersScreenshots.onRendered(function () {
    var self = this;
    var dayToShowScreenshots = this.data.dayToShowScreenshots;
    this.$('.datepicker').pickadate({
        selectMonths: true,
        selectYears: 7,
        onStart: function () {
            return this.set('select', moment(dayToShowScreenshots).toDate(), {format: 'd mmmm, yyyy'});
        }
    });
    this.datePickerDate.set($('.datepicker').val());

    this.autorun(function () {
        self.isReady.get();
        self.$('select').material_select();
    });
});
Template.workersScreenshots.helpers({
    screenshots: function () {
        var tmpl = Template.instance();
        var userId = Meteor.userId();
        var query = _.clone(tmpl.searchQuery1.get());
        var timeFormat = tmpl.timeFormat.get() || '24';
        var screenshotsTimeFormat = tmpl.getScreenshotsTimeFormat(timeFormat);
        var dayStartEndTime = tmpl.getDayStartEndTime();
        var timeZone = tmpl.data.timeZone;
        var timeZoneName = tmpl.getTimeZoneName(timeZone);
        var offset = moment.tz(timeZoneName).utcOffset() / 60;


        var timeEntries = TimeEntries.find(query, {sort: {startDate: 1}});
        var timeEntriesIds = timeEntries.map(function (timeEntry) {
            return timeEntry._id;
        });
        var timeEntriesAndTasks = timeEntries.map(function (timeEntry) {
            return {timeEntryId: timeEntry._id, taskName: timeEntry.message, _isActive: timeEntry._isActive};
        });
        var screenshots = Screenshots.find({
            timeEntryId: {$in: timeEntriesIds},
            takenAt: {
                $gte: dayStartEndTime.startOfDay,
                $lte: dayStartEndTime.endOfDay
            }
        }, {sort: {takenAt: 1}});
        var screenshotsWithTaskName = screenshots.map(function (screenshot) {
            var greenWitchTime = tmpl.getGreenWitchTime(screenshot.takenAt);
            screenshot.takenAt = greenWitchTime.add(offset, 'hours').toDate();
            _.each(timeEntriesAndTasks, function (element) {
                if (screenshot.timeEntryId == element.timeEntryId) {
                    screenshot.taskName = element.taskName;
                    screenshot.isEntryActive = element._isActive;
                }
            });
            return screenshot;
        });
        var screenshotsByTimeGroup = _.groupBy(screenshotsWithTaskName, function (screenshot) {
            return moment(screenshot.takenAt).get('hour');
        });

        var timePeriods;
        _.each(screenshotsByTimeGroup, function (value, key) {
            if (value.length != 6) {
                var allPeriods = [];
                var step = 10;
                for (var i = 0; i < 6; i++) {
                    var newKey = _.clone(key);
                    if (newKey < 10 && newKey != 0) {
                        newKey = '0' + newKey;
                    }
                    else if (newKey == 0) {
                        newKey = '00';
                    }
                    if (i == 0) {
                        allPeriods.push(newKey + ':00');
                    }
                    else {
                        allPeriods.push(newKey + ':' + step);
                        step += 10
                    }
                }
                var date = moment(new Date(value[0].takenAt)).format('YYYY/MM/DD');
                timePeriods = _.map(value, function (screenshot) {
                    var time = moment(new Date(screenshot.takenAt)).format('YYYY/MM/DD HH:mm');
                    var isLess10 = moment(new Date(screenshot.takenAt)).get('minute');
                    var formated = moment(new Date(time));

                    var remainder = (10 - formated.minute()) % 10;
                    if (isLess10 < 10 && isLess10 >= 1) {
                        remainder = -isLess10;
                    }
                    return moment(new Date(formated)).add(remainder, 'minutes').format('HH:mm');
                });
                var relaxTimePeriods = _.difference(allPeriods, timePeriods);
                _.each(relaxTimePeriods, function (time) {
                    value.push({takenAt: moment(new Date(date + ' ' + time)).toDate(), deleted: true});
                    value.sort(function (a, b) {
                        return new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime()
                    });
                });
            }
        });

        var hours = _.keys(screenshotsByTimeGroup);
        var allScreens = _.map(hours, function (hour) {
            var screens;
            _.each(screenshotsByTimeGroup, function (value, key) {
                if (hour == key) {
                    screens = value;
                }
            });
            return {takenAt: moment(hour, "hh").format(screenshotsTimeFormat), screens: screens}
        });
        var contracts = Contracts.find({employerId: Meteor.userId()}).fetch();
        var employerIds = _.map(contracts, function (contract) {
            return contract.workerId;
        });
        tmpl.screens.set(allScreens);
        return employerIds.length > 0  && query.userId != Meteor.userId() ? allScreens: [];
    },
    datePickerDate: function () {
        var dayToShowScreenshots = Template.instance().datePickerDate.get();
        return moment(new Date(dayToShowScreenshots)).format('ddd, D MMMM YYYY');
    },
    selectedTimeZone: function (timeZoneFormat) {
        var timeZone = Template.instance().data.timeZone;
        return timeZone == timeZoneFormat ? 'selected' : '';
    },
    selectedTimeFormat: function (selectedTimeFormat) {
        var timeFormat = Template.instance().timeFormat.get() || '24';
        return selectedTimeFormat == timeFormat ? 'selected' : '';
    },
    screenshotTimePeriod: function () {
        var takenAt = this.takenAt;
        return Template.instance().getTimePeriod(takenAt);
    },
    getHours: function (takenAt) {
        // var regEx = new RegExp('/\d+\s(am|pm)/g');
        return takenAt.split(' ')[0];
    },
    getDayPeriod: function (takenAt) {
        return takenAt.split(' ')[1];
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
    isScreensLoaded: function () {
        var tmpl = Template.instance();
        return tmpl.isReady.get();
    },
    isScreensFound: function () {
        var tmpl = Template.instance();
        var screens = tmpl.screens.get();
        return screens.length > 0;
    }
});
Template.workersScreenshots.events({
    'change .datepicker': function (event, tmpl) {
        event.preventDefault();
        var $input = tmpl.$('.datepicker').pickadate();
        var date = new Date($input.val());
        var screenshotsDate = moment(date).format('YYYY-MM-DD');
        var timeZone = tmpl.data.timeZone;
        var query = {};
        tmpl.datePickerDate.set($input.val());
        Router.go('screenshots', {screenshotsDate: screenshotsDate, timeZone: timeZone}, {query: query});
    },
    'click #previous-day': function (event, tmpl) {
        event.preventDefault();
        tmpl.changeDay('yeasterday');
    },
    'click #next-day': function (event, tmpl) {
        event.preventDefault();
        tmpl.changeDay('tomorrow');
    },
    'change #time-zone-select': function (event, tmpl) {
        event.preventDefault();
        var timeZone = tmpl.$('#time-zone-select option:selected').val();
        var dayToShowScreenshots = tmpl.data.dayToShowScreenshots;
        var query = {};
        Router.go('screenshots', {screenshotsDate: dayToShowScreenshots, timeZone: timeZone}, {query: query});
    },
    'change #time-format-select': function (event, tmpl) {
        event.preventDefault();
        var timeFormat = tmpl.$("#time-format-select option:selected").val();
        tmpl.timeFormat.set(timeFormat);
    },
    'click #delete-screenshot': function (event, tmpl) {
        event.preventDefault();
        var id = this._id;
        Meteor.call('deleteScreenshot', id, function (err, res) {
            if (err) {
                VZ.notify('Failed to delete');
            }
            else {
                VZ.notify('Screenshot deleted!');
            }
        });
    },
    'click .dropdown-content': function (event, tmpl) {
        event.stopPropagation();
    },
    'change #users-select': function (event, tmpl) {
        event.preventDefault();
        var userId = tmpl.$('#users-select option:selected').val();
        tmpl.isReady.set(false);
        tmpl.searchQuery1.set({userId: userId});
    },
    'click #screenshot-img': function (event, tmpl) {
        event.preventDefault();
        var screenshot = this;
        var screens = tmpl.screens.get();
        var parentNode = $('body')[0],
            modalData = {
                screenshot: screenshot,
                screens: screens
            };
        if(this.screenshotOriginalURL){
            Blaze.renderWithData(Template.screenshotModal, modalData, parentNode);

        }
    }
});