import { Countries } from '/imports/api/countries/countries';
import { Skills } from '/imports/api/skills/skills';
import { Jobs } from '../jobs';
import { VZ } from '/imports/startup/both/namespace';

Meteor.publishComposite('job', function (jobId) {
    if (VZ.canUser('viewJob', this.userId, jobId)) {
        return {
            find: function () {
                return Jobs.find(jobId);
            },
            children: [
                {
                    find: function (job) {
                        var skillsIds = job.skillsIds || [];
                        return Skills.find({_id: {$in: skillsIds}});
                    }
                }
            ]
        }
    } else {
        this.ready();
    }
});

Meteor.publish('userSkillsByRegEx', function (searchString) {
    var userId = this.userId;
    var user = Meteor.users.findOne({_id: userId});
    var skillsIds = user && user.profile && user.profile.skills;
    var searchParams = {};
    if (searchString != '') {
        var searchStringRegExp = new RegExp(searchString, 'ig');
        searchParams.$or = [{label: {$regex: searchStringRegExp}},
            {_id: {$in: skillsIds}}
        ];
    } else {
        searchParams.$or = [{label: 'no-skill'},
            {_id: {$in: skillsIds}}
        ];
    }
    // searchParams.isArchived = false;
    return Skills.find(searchParams, {fields: {_id: 1, label: 1, isArchived: 1}});
});

Meteor.publish('userSkills', function (userId) {
    var user = Meteor.users.findOne({_id: userId});
    var skillsIds = user && user.profile && user.profile.skills;
    var searchParams = {};
    searchParams._id = {$in: skillsIds || []};
    // searchParams.isArchived = false;
    return Skills.find(searchParams, {fields: {_id: 1, label: 1, isArchived: 1}});
});

Meteor.publish('userJobs', function (params, options) {
    params = params || {};
    options = options || {};

    // params.isArchived = false;
    params.ownerId = this.userId;

    return Jobs.find(params, options);
});

Meteor.publish('jobs', function (params, options) {
    params = params || {};
    options = options || {};
    return Jobs.find(params, options);
});
Meteor.publish('allCountries', function () {
    return Countries.find({},{sort:{label: 1}});
});
Meteor.publish('allSkills', function(userId, isNotArchived) {
    if(userId || this.userId) {
        var params = {};
        if(isNotArchived){
            params.isArchived = false;
        }
        return Skills.find(params);
    } else {
        return this.ready();
    }
});
Meteor.publish('allSkillsForAdmin', function(userId) {
    if(userId === 'wh8or4SeGKKr5WTDs' || this.userId) {
        return Skills.find();
    } else {
        return this.ready();
    }
});
Meteor.publish('oneSkillForAdmin', function(id, userId) {
    if(userId === 'wh8or4SeGKKr5WTDs' || this.userId) {
        return Skills.find({_id: id});
    } else {
        return this.ready();
    }
});
Meteor.publish('allSkillsForAdminByQuery', function (params, options, userId) {
    if(userId === 'wh8or4SeGKKr5WTDs' || this.userId) {
        params = params || {};
        options = options || {};
        Counts.publish(this, 'allSkillsForAdminCount', Skills.find({isArchived: false}), { noReady: true });
        Counts.publish(this, 'archivedSkillsForAdminCount', Skills.find({isArchived: true}), { noReady: true });
        return Skills.find(params, options);
    }
    else {
        return this.ready();
    }
});
Meteor.publish('allJobsForAdmin', function (userId) {
    if(userId === 'wh8or4SeGKKr5WTDs' || this.userId) {
        return Jobs.find();
    } else {
        return this.ready();
    }
});
Meteor.publish('oneJobForAdmin', function (id, userId) {
    if(userId === 'wh8or4SeGKKr5WTDs' || this.userId) {
        return Jobs.find({_id: id});
    } else {
        return this.ready();
    }
});

Meteor.publish('userSkillsForAdmin', function (userId) {
    var user = Meteor.users.findOne({_id: userId});
    var skillsIds = user && user.profile && user.profile.skills;
    var searchParams = {};
    searchParams._id = {$in: skillsIds};
    return Skills.find(searchParams);
});