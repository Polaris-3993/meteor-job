import { VZ } from '/imports/startup/both/namespace';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Projects } from  '/imports/api/projects/projects';
import { Screenshots } from '/imports/api/screenShots/screenShots';
import './screenshots-list.html';

Template.screenshotsList.onCreated(function () {
    this.searchQuery = new ReactiveVar({});
    this.timeFormat = new ReactiveVar('');
    this.datePickerDate = new ReactiveVar('');
    this.screenshotFullSizeUrl = new ReactiveVar('');

    var self = this;
    this.getGreenWitchTime = function (date) {
        return moment(date.getTime() + (date.getTimezoneOffset() * 60000));
    };
    this.getTimeZoneName = function (timeZone) {
        var utc;
        var ownUtc = moment.tz.guess();
        switch (timeZone) {
            case 'utc':
                utc = 'Etc/Greenwich';
                break;
            case 'mine':
                utc = ownUtc;
                break;
            case 'ny':
                utc = 'America/New_York';
                break;
            case 'london':
                utc = 'Europe/London';
                break;
            case 'berlin':
                utc = 'Europe/Berlin';
                break;
            default:
                return false;
        }
        return utc;
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
    this.autorun(function () {
        var data = Template.currentData();
        var project = data.projectIds;
        var searchQuery = {};
        if (project.length > 0) {
            searchQuery.projectId = {$in: project}
        }
        self.searchQuery.set(searchQuery);
    });
    this.autorun(function () {
        var searchQuery = _.clone(self.searchQuery.get());
        self.subscribe('projects');
        self.subscribe('timeEntriesAndScreenshots', searchQuery);
    });
    this.changeDay = function (day) {
        var date;
        var $input = self.$('.datepicker').pickadate();
        var picker = $input.pickadate('picker');
        var dayToShowScreenshots = self.data.dayToShowScreenshots.replace(/-/g, '/');
        var today = new Date(dayToShowScreenshots);
        var projectIds = self.data.projectIds;
        var timeZone = self.data.timeZone;
        var query = {project: projectIds};
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
});
Template.screenshotsList.onRendered(function () {
    var dayToShowScreenshots = this.data.dayToShowScreenshots;
    this.$('.datepicker').pickadate({
        selectMonths: true,
        selectYears: 7,
        onStart: function () {
            return this.set('select', moment(dayToShowScreenshots).toDate(), {format: 'd mmmm, yyyy'});
        }
    });
    this.$('.dropdown-button').dropdown({
        belowOrigin: true
    });
    this.$('.modal-trigger').modal({
            dismissible: true, // Modal can be dismissed by clicking outside of the modal
            opacity: .5, // Opacity of modal background
            in_duration: 200, // Transition in duration
            out_duration: 1500 // Transition out duration
        }
    );
    this.datePickerDate.set($('.datepicker').val());
});
Template.screenshotsList.helpers({
    screenshots: function () {
        var userId = Meteor.userId();
        var query = Template.instance().searchQuery.get();
        var timeFormat = Template.instance().timeFormat.get() || '12';
        var screenshotsTimeFormat = Template.instance().getScreenshotsTimeFormat(timeFormat);
        var dayStartEndTime = Template.instance().getDayStartEndTime();
        var timeZone = Template.instance().data.timeZone;
        var timeZoneName = Template.instance().getTimeZoneName(timeZone);
        var offset = moment.tz(timeZoneName).utcOffset() / 60;

        var searchQuery = _.extend(query, {
                        userId: userId
        });
        var timeEntries = TimeEntries.find(searchQuery, {sort: {startDate: 1}});
        var timeEntriesIds = timeEntries.map(function (timeEntry) {
            return timeEntry._id;
        });
        var timeEntriesAndTasks = timeEntries.map(function (timeEntry) {
            return {timeEntryId: timeEntry._id, taskName: timeEntry.message};
        });
        var screenshots = Screenshots.find({
            timeEntryId: {$in: timeEntriesIds},
            takenAt: {
                $gte: dayStartEndTime.startOfDay,
                $lte: dayStartEndTime.endOfDay
            }
        }, {sort: {takenAt: 1}});
        var screenshotsWithTaskName = screenshots.map(function (screenshot) {
            var greenWitchTime = Template.instance().getGreenWitchTime(screenshot.takenAt);
            screenshot.takenAt = greenWitchTime.add(offset, 'hours').toDate();
            _.each(timeEntriesAndTasks, function (element) {
                if (screenshot.timeEntryId == element.timeEntryId) {
                    screenshot.taskName = element.taskName
                }
            });
            return screenshot;
        });
        var screenshotsByTimeGroup = _.groupBy(screenshotsWithTaskName, function (screenshot) {
            return moment(screenshot.takenAt).get('hour');
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
        return allScreens;
    },
    projects: function () {
        var userId = Meteor.userId();
        return Projects.find({
            $or: [{assignedUsersIds: userId}, {ownerId: userId}],
            archived: false
        });
    },
    shouldShowChecked: function (val) {
        var projectIds = Template.instance().data.projectIds;
        var property = val['_id'];
        return _.isArray(projectIds) ? _.find(projectIds, function (item) {
            return item == property;
        }) : false;
    },
    screenshotsTimeFormat: function () {
        var format;
        var timeFormat = Template.instance().timeFormat.get() || '12';
        switch (timeFormat) {
            case '12':
                format = 'h:mm a';
                break;
            case '24':
                format = 'HH:mm';
                break;
            default:
                return false;
        }
        return format;
    },
    datePickerDate: function () {
        var dayToShowScreenshots = Template.instance().datePickerDate.get();
        return moment(new Date(dayToShowScreenshots)).format('ddd, D MMMM YYYY');
    },
    selectedTimeZone: function (timeZoneFormat) {
        var timeZone = Template.instance().data.timeZone;
        return timeZone == timeZoneFormat ? 'selected' : '';
    },
    userTimeZone: function () {
        return '(' + moment.tz(moment.tz.guess()).format('Z') + ')';
    },
    selectedTimeFormat: function (selectedTimeFormat) {
        var timeFormat = Template.instance().timeFormat.get() || '12';
        return selectedTimeFormat == timeFormat ? 'selected' : '';
    },
    screenshotURL: function () {
        return Template.instance().screenshotFullSizeUrl.get();
    }
});
Template.screenshotsList.events({
    'change .project-change': function (event, tmpl) {
        event.preventDefault();
        var timeZone = tmpl.data.timeZone;
        var dayToShowScreenshots = tmpl.data.dayToShowScreenshots;
        var projectIds = tmpl.data.projectIds;
        var checked = tmpl.$(event.currentTarget).prop('checked');
        var id = event.target.id;

        if (_.isArray(projectIds)) {
            if (checked) {
                projectIds.push(id);
            }
            else {
                projectIds = _.reject(projectIds, function (item) {
                    return item == id;
                });
            }
        } else {
            projectIds = [];
            projectIds.push(id);
        }
        var query = {project: projectIds};
        Router.go('screenshots', {screenshotsDate: dayToShowScreenshots, timeZone: timeZone}, {query: query});
    },
    'change .datepicker': function (event, tmpl) {
        event.preventDefault();
        var $input = tmpl.$('.datepicker').pickadate();
        var date = new Date($input.val());
        var screenshotsDate = moment(date).format('YYYY-MM-DD');
        var projectIds = tmpl.data.projectIds;
        var timeZone = tmpl.data.timeZone;
        var query = {project: projectIds};
        tmpl.datePickerDate.set($input.val());
        Router.go('screenshots', {screenshotsDate: screenshotsDate, timeZone: timeZone}, {query: query});
    },
    'click .previous-day': function (event, tmpl) {
        event.preventDefault();
        tmpl.changeDay('yeasterday');
    },
    'click .next-day': function (event, tmpl) {
        event.preventDefault();
        tmpl.changeDay('tomorrow');
    },
    'click .vz-screenshot': function (event, tmpl) {
        event.preventDefault();
        var $screenshot = tmpl.$(event.currentTarget);
        $screenshot.toggleClass('active');
    },
    'change #time-zone-select': function (event, tmpl) {
        event.preventDefault();
        var timeZone = tmpl.$("#time-zone-select option:selected").val();
        var projectIds = tmpl.data.projectIds;
        var dayToShowScreenshots = tmpl.data.dayToShowScreenshots;
        var query = {project: projectIds};
        Router.go('screenshots', {screenshotsDate: dayToShowScreenshots, timeZone: timeZone}, {query: query});
    },
    'change #time-format-select': function (event, tmpl) {
        event.preventDefault();
        var timeFormat = tmpl.$("#time-format-select option:selected").val();
        tmpl.timeFormat.set(timeFormat);
    },
    'click .delete-screenshot': function (event, tmpl) {
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
    'click .resize-screenshot': function (event, tmpl) {
        event.preventDefault();
        tmpl.screenshotFullSizeUrl.set(this.screenshotOriginalURL);
        tmpl.$('#modal1').modal();
        tmpl.$('#modal1').modal('open');

    }
});