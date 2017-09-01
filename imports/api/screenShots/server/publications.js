import { Screenshots } from '../screenShots';

Meteor.publish('lastTakenScreenshot', function (projectId) {
    if (!this.userId) {
        return this.ready();
    }

    var relatedTimeEntriesIds = TimeEntries
        .find({projectId: projectId}).map(function (timeEntry) {
            return timeEntry._id;
        });

    return Screenshots.find({timeEntryId: {$in: relatedTimeEntriesIds}},
        {sort: {takenAt: -1}, limit: 1});
});