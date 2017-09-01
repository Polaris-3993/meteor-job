import { UserWorkExperience } from './userWorkExperience';

Meteor.methods({
    addWorkExperience: function (job) {
        var userId = this.userId;
        if (userId) {
            if(!job.isWorking){
                if (moment(job.startAt).isAfter(moment(job.completeAt))) {
                    throw new Meteor.Error('Start date should be greater than job complete date!');
                }
            }
            var id = UserWorkExperience.insert(job);
            Meteor.users.update({
                _id: userId
            }, {
                $addToSet: {
                    'profile.workExperienceIds': id
                }
            }, function (err) {
                if (err) {
                    throw new Meteor.Error('Failed to insert');
                }
            });
        }

    },
    updateWorkExperience: function (id, job) {
        var userId = this.userId;
        if (userId) {
            if(!job.isWorking){
                if (moment(job.startAt).isAfter(moment(job.completeAt))) {
                    throw new Meteor.Error('Start date should be greater than job complete date!');
                }
            }
            UserWorkExperience.update({_id: id}, {$set: job}, function (error) {
                if (error) {
                    throw new Meteor.Error(error.message);
                }
            });
        }
    },
    removeWorkExperience: function (id) {
        var userId = this.userId;
        if (userId) {
            UserWorkExperience.remove(id);
            Meteor.users.update({_id: userId}, { $pull: { 'profile.workExperienceIds': id }});
        }
    }
});