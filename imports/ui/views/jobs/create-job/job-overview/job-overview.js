import { VZ } from '/imports/startup/both/namespace';
import { Skills } from '/imports/api/skills/skills';
import './job-overview.html';

Template.overviewJob.helpers({
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
            else if(jobSalary.type == 'Montly'){
                salary =  '$'+jobSalary.montlyRate;
            }
            else if(jobSalary.type == 'Hourly'){
                salary =  '$'+jobSalary.hourlyRate;
            }
            else if(jobSalary.type == 'Fixed price'){
                salary =  '$'+jobSalary.contractPrice;
            }
            return salary;
        }
    }
});

Template.overviewJob.events({
    'click .discard': function (event, tmpl) {
        event.preventDefault();
        var jobId = this.job._id;
        Router.go('addLocation', {id: jobId});
    },
    'click .next': function (event, tmpl) {
        event.preventDefault();
        var job = this.job;
        if(job){
            job.isDraft = false;
            Meteor.call('editJob', job, function (error, result) {
                if (error) {
                    var message = error.reason || error.message;
                    VZ.notify(message.replace('Match error: Match error: Match error: ',''));
                } else {
                    Router.go('userJobs');
                }
            });
        }
    }
});