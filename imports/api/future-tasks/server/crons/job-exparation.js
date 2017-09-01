import { Jobs } from '/imports/api/jobs/jobs';

SyncedCron.add({
    name: 'Changing job expire status',
    schedule: function (parser) {
        return parser.text('every 5 mins');
    },
    job: function () {
        var jobs = Jobs.find().fetch(),
            currDate = moment();
        _.each(jobs, function (job) {
            var expireAt = moment(job.expireAt),
                diff = currDate.diff(expireAt, 'milliseconds'),
                oneWeek = 604800000;


            if (Math.abs(diff) <= oneWeek && !(currDate >= expireAt)) {
                makeExpireSoon(job._id);
            } else if (currDate >= expireAt) {
                makeClosed(job._id);
            }
        });
    }
});
var makeExpireSoon = function (id) {
    var jobToUpdate = Jobs.findOne({_id: id});
    if (jobToUpdate) {
        Jobs.update({_id: id}, {$set: {status: 'Will expire soon'}})
    }
    else {
        throw new Meteor.Error('Job is not found');
    }
};

var makeClosed = function (id) {
    var jobToUpdate = Jobs.findOne({_id: id});
    if (jobToUpdate) {
        Jobs.update({_id: id}, {$set: {status: 'Closed'}})
    }
    else {
        throw new Meteor.Error('Job is not found');
    }
};