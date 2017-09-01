import { VZ } from '/imports/startup/both/namespace';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Projects } from '/imports/api/projects/projects';
import './project-info-layout.html';
import { timeEntriesSubs } from '/imports/startup/client/subManagers';

Template.projectInfoLayout.onCreated(function () {
    var self = this;
    this.autorun(function () {
        var data = Template.currentData();
        var projectId = data.project && data.project._id;
        timeEntriesSubs.subscribe('projectTimeEntries', projectId);
    });
});
Template.projectInfoLayout.onRendered(function () {
});

Template.projectInfoLayout.helpers({
    timeTracked: function () {
        var projectId = this.project._id;
        var projectInfo = this.project && this.project.info;
        var tasksCount = projectInfo && projectInfo.tasksCount || 0;
        var tasksCompleted = projectInfo && projectInfo.tasksCompleted || 0;
        var project = Projects.findOne({_id: projectId});
        var projectData = {
            name: project.name,
            time: 0,
            tasks: {
                all: 0,
                completed: 0
            },
            totalSpendings: 0,
            people: project.assignedUsersIds ? project.assignedUsersIds.length : 0,
            lastUpdate: ''
        };
        var entries = TimeEntries.find({
            projectId: project._id
        }).fetch();

        _.each(entries, function (entry) {
            var diff = moment(entry.endDate).diff(entry.startDate, 'second');
            projectData.time += diff;
        });

        projectData.tasks.all = tasksCount;
        projectData.tasks.completed = tasksCompleted;
        return projectData;

    },
    assignedUsersCount: function () {
        return this.project.assignedUsersIds && this.project.assignedUsersIds.length || 0;
    },
    canEditProject: function () {
        var projectId = this.project && this.project._id;
        return VZ.canUser('editProject', Meteor.userId(), projectId);
    }
});

Template.projectInfoLayout.events({});
