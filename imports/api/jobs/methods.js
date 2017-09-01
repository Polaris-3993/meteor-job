import { Skills } from  '/imports/api/skills/skills';
import { Jobs } from './jobs';
import { Companies } from '/imports/api/companies/companies';
import { VZ } from '/imports/startup/both/namespace';

Meteor.methods({
    'createJob': function (jobObject) {
        check(jobObject, JobsChecker);
        var userId = this.userId;
        var date = new Date();
        var userCompanies = Companies.find({ownerId: userId}, {sort: {createdAt: -1}}).count();
        if(!userCompanies){
            throw new Meteor.Error('Permission error', 'Create company to add job !');
        }
        var userCompany = Companies.find({ownerId: userId}, {sort: {createdAt: -1}}).fetch();

        // jobObject.isPublished = false;
        jobObject.companyId = userCompany[0]._id;
        jobObject.ownerId = userId;
        jobObject.applicantsIds = [];
        jobObject.viewerIds = [];
        jobObject.status = 'Opened';

        jobObject.isArchived = false;
        // jobObject.isPublished = false;
        // jobObject.lastEditedBy = userId;
        jobObject.createdAt = date;
        jobObject.isDraft = true;

        var currentDate = moment(date);
        var futureMonth = currentDate.add(1, 'months').format('MM/DD/YYYY');
        // var futureMonth = moment(currentDate).add(1, 'M');
        // var futureMonthEnd = moment(futureMonth).endOf('month');

        // if(currentDate.date() != futureMonth.date() && futureMonth.isSame(futureMonthEnd.format('YYYY-MM-DD'))) {
        //     futureMonth = futureMonth.add(1, 'd');
        // }
        jobObject.expireAt = new Date(futureMonth);
        // jobObject.lastEditedAt = new Date();
        var jobId = Jobs.insert(jobObject);

        Roles.addUsersToRoles(userId, 'job-owner', jobId);

        return jobId;
    },

    'editJob': function (jobObject) {
        var userId = this.userId;
        if (!VZ.canUser('editJob', userId, jobObject._id)) {
            throw new Meteor.Error('Permission error', 'You can\' edit this job!');
        }
        check(jobObject, JobsChecker);
        //
        // jobObject.lastEditedBy = userId;
        // jobObject.lastEditedAt = new Date();
        //
        // var updateQuery = {$set: jobObject};
        // if (!jobObject.employeeOriginCountry) {
        //     updateQuery.$unset = {};
        //     updateQuery.$unset.employeeOriginCountry = false;
        // }
        // if (!jobObject.salary) {
        //     updateQuery.$unset = updateQuery.$unset || {};
        //     updateQuery.$unset.salary = false;
        // }
        // if (!jobObject.equity) {
        //     updateQuery.$unset = updateQuery.$unset || {};
        //     updateQuery.$unset.equity = false;
        // }

        Jobs.update({_id: jobObject._id}, {$set: jobObject});
    },
    'editWorkerLocation': function (jobObject, jobId) {
        var userId = this.userId;
        if (!VZ.canUser('editJob', userId, jobId)) {
            throw new Meteor.Error('Permission error', 'You can\' edit this job!');
        }
        if(!jobObject.workerLocation){
            throw new Meteor.Error('Validation error', 'Select location');
        }
        if(jobObject.workerLocation.isRestricted){
            if(!jobObject.workerLocation.continent){
                throw new Meteor.Error('Validation error', 'Select continent');
            }
            if(!jobObject.workerLocation.country){
                throw new Meteor.Error('Validation error', 'Select country');
            }
        }
        Jobs.update({_id: jobId}, {$set: jobObject});
    },

    archiveJobs: function (jobsIds) {
        for (var i=0; i < jobsIds.length; i++){
            Jobs.update({_id: jobsIds[i]}, {
                $set: {
                    isArchived: true
                }
            });
        }

    },
    restoreJobs: function (jobsIds) {
        for (var i=0; i < jobsIds.length; i++){
            Jobs.update({_id: jobsIds[i]}, {
                $set: {
                    isArchived: false
                }
            });
        }

    },
    applyforJob: function (jobId) {
        var userId = this.userId;
        if(userId){
            Jobs.update({_id: jobId}, {$addToSet: {'applicantsIds': userId}});
        }
    },

    'archiveJob': function (jobId) {
        var userId = this.userId;
        if (!VZ.canUser('archiveJob', userId, jobId)) {
            throw new Meteor.Error('Permission error', 'You can\' archive this job!');
        }

        Jobs.update({_id: jobId}, {$set: {isArchived: true}});
    },
    'restoreJob': function (jobId) {
        Jobs.update({_id: jobId}, {$set: {isArchived: false}});
    },
    addViewCount: function (jobId) {
        var userId = this.userId;
        var job = Jobs.findOne({_id: jobId});
        var viewerIds = job.viewerIds || [];
        if(_.indexOf(viewerIds, userId) == -1){
            Jobs.update({_id: jobId}, {$addToSet: {'viewerIds': userId}});
        }
    },
    'addSkill': function (skillDoc) {
        return Skills.insert(skillDoc);
    },

    'deleteSkill': function (skillId) {
        Skills.remove(skillId);
    },
    'getUserCountry': function () {
        var syncHTTP = Meteor.wrapAsync(HTTP.get, this);
        try {
            var res = HTTP.get('http://ipinfo.io');
            return res;
        }
        catch (err) {
            console.log(err);
        }
    }
});