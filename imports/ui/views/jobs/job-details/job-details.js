import { VZ } from '/imports/startup/both/namespace';
import { Skills } from '/imports/api/skills/skills';
import './job-details.html';

Template.jobDetails.onCreated(function () {
    var jobId = this.data.job._id;
    Meteor.call('addViewCount', jobId, function (error, result) {
        if(error){
            VZ.notify(error.message);
        }
    });
});

Template.jobDetails.helpers({
    jobSkills: function () {
        var skillsIds = Template.instance().data.job.skillsIds || [];
        var skillLabels =  _.map(skillsIds, function (element) {
            return {tag: Skills.findOne({_id:element}).label};
        });
        return _.map(skillLabels, function (element) {
            return element.tag;
        }).join().replace(/,/gi, ', ');
    },
    salary: function () {
        var salary;
        var tmpl = Template.instance();
        var jobSalary = tmpl.data.job.salary;
        if(jobSalary){
            if(jobSalary.type == 'Annual'){
                salary =  '$'+jobSalary.min+'-'+'$'+jobSalary.max;
            }
            else if(jobSalary.type == 'Hourly'){
                salary =  '$'+jobSalary.hourlyRate;
            }
            else if(jobSalary.type == 'Fixed price'){
                salary =  '$'+jobSalary.contractPrice;
            }
            return salary;
        }
    },
    applied: function () {
        var applicantsIds = Template.instance().data.job.applicantsIds || [];
        var userId = Meteor.userId();
        return _.indexOf(applicantsIds, userId) == -1;
    },
    isDraft: function () {
        var tmpl = Template.instance();
        return tmpl.data.job.isDraft;
    },
    isExpired: function () {
        var tmpl = Template.instance();
        var currDate = moment();
        var expireAt = moment(tmpl.data.job.expireAt);
        return currDate >= expireAt
    }
});

Template.jobDetails.events({
    'click .discard': function (event, tmpl) {
        event.preventDefault();
        Router.go('userJobs');
    },
    'click .apply': function (event, tmpl) {
        event.preventDefault();
        var jobId = this.job._id;
        if(jobId){
            Meteor.call('applyforJob', jobId, function (error, result) {
                if (error) {
                    var message = error.reason || error.message;
                    VZ.notify(message.replace('Match error: Match error: Match error: ',''));
                } else {
                    VZ.notify('Applied');
                    Router.go('userJobs');
                }
            });
        }
    }
});