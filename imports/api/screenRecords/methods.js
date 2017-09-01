import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { ScreenRecords } from './screenRecords';
import { Screenshots } from '/imports/api/screenShots/screenShots';

Meteor.methods({
    uploadScreenRecord: function (buffer, type) {
        var userId = this.userId;
        if (userId) {
            var index = ScreenRecords.find({userId: userId}).count() + 1;

            var params = {
                name: userId+'/'+index,
                type: type,
                buffer: buffer,
                bucketName: 'vezio_screen_recordings'
            };
            try {
                var mediaLink = Meteor.call('uploadVideo', params);
                console.log(mediaLink);
                ScreenRecords.insert({
                    userId: userId,
                    index: index,
                    link: mediaLink
                });
            } catch (e) {
                return e;
            }
        }
    },
    deleteScreenshot: function (id) {
        var userId = this.userId;
        if (userId) {

            var screenshot = Screenshots.findOne({_id: id});
            var timeEntry = TimeEntries.findOne({_id: screenshot.timeEntryId});

            var timeEntryStartDate = moment(timeEntry.startDate).toDate();
            var timeEntryTimeTracked = timeEntry._totalMinutes;
            var screenShoots = Screenshots.find({
                timeEntryId: timeEntry._id
            }, {$sort: {takenAt: 1}}).fetch();

            var notDeleted = _.reject(screenShoots, function (screen) {
                return _.has(screen, 'deleted') && screen.deleted;
            });
            if (timeEntryTimeTracked == 0) {
                Screenshots.update({_id: id}, {$set: {deleted: true}});
            }
            else if (notDeleted.length == 1) {
                Screenshots.update({_id: id}, {$set: {deleted: true}});
                TimeEntries.update({_id: timeEntry._id}, {$set: {_totalMinutes: 0}});
            }
            else {
                for (var i = 0; i < screenShoots.length; i++) {
                    if (screenShoots[i - 1] && screenShoots[i - 1]._id && screenShoots[i]._id == id) {
                        var previousScreenDate = moment(screenShoots[i - 1].takenAt).toDate();
                        var currentScreenDate = moment(screenShoots[i].takenAt).toDate();
                        var screenTrackedTime = Math.abs(moment(currentScreenDate).diff(previousScreenDate, 'minutes'));
                        var newTimeEntryTrackedTime = timeEntryTimeTracked - screenTrackedTime;
                        Screenshots.update({_id: id}, {$set: {deleted: true}});
                        TimeEntries.update({_id: timeEntry._id}, {$set: {_totalMinutes: newTimeEntryTrackedTime}});
                    }
                    else if (screenShoots[i]._id == id) {
                        var currentScreenDateP = moment(screenShoots[i].takenAt).toDate();
                        var diff = Math.abs(moment(currentScreenDateP).diff(timeEntryStartDate, 'minutes'));
                        var newTimeEntryTrackedTime = timeEntryTimeTracked - diff;
                        Screenshots.update({_id: id}, {$set: {deleted: true}});
                        TimeEntries.update({_id: timeEntry._id}, {$set: {_totalMinutes: newTimeEntryTrackedTime}});
                    }
                }
            }
        }
    }
});