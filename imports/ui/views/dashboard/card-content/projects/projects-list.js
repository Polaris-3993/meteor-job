import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Projects } from '/imports/api/projects/projects';
import { Tasks } from '/imports/api/tasks/tasks';
import './projects-list.html';
import { timeEntriesSubs } from '/imports/startup/client/subManagers';

Template.dashboardProjectsList.onCreated(function () {
    var self = this;
    this.ready = new ReactiveVar(false);
    this.autorun(function () {
        var sub = timeEntriesSubs.subscribe('timeEntriesForUserProjects', true);
        if(sub.ready()){
            self.ready.set(true);
        }
    });
});

Template.dashboardProjectsList.helpers({
    projectsItems: function () {
        var tmpl = Template.instance();
        var ready = tmpl.ready.get();
        if(ready){
        var result = [];
        var projects = Projects.find({archived: false}).fetch();

        _.each(projects, function (project) {
            var projectData = {
                id: project._id,
                name: project.name,
                time: 0,
                tasks: {
                    all: 0,
                    completed: 0,
                    percent: 0
                },
                totalSpendings: 0,
                people: project.assignedUsersIds ? project.assignedUsersIds.length + 1 : 0,
                lastUpdate: ''
            };

            var entries = TimeEntries.find({
                projectId: project._id,
                userId: Meteor.userId()
            }).fetch();

            _.each(entries, function (entry) {
                var diff = moment(entry.endDate).diff(entry.startDate, 'second');
                projectData.time += diff;
            });

            var tasks = Tasks.find({
                projectId: project._id
            }).fetch();
            var completedTasks = _.where(tasks, {status: "Closed"});
            var lastTask = Tasks.find({
                projectId: project._id
            }, {limit: 1, sort: {editedAt: -1}}).fetch();

            projectData.tasks.all = tasks.length;
            projectData.tasks.completed = completedTasks.length;

            if (tasks.length > 0 && completedTasks.length > 0) {
                projectData.tasks.percent = Math.round((100 / tasks.length) * completedTasks.length);
            }
            else {
                projectData.tasks.percent = 0;
            }

            projectData.lastUpdate = moment(project.updatedAt).calendar();

            result.push(projectData);
        });
        return result;
        }
        else {
            return [];
        }
    },
    emptyCardMessage: function () {
        return 'There are no projects to show';
    },
    dataLoadingMessage: function () {
        return 'Loading...';
    },
    ready: function () {
        return Template.instance().ready.get();
    }
});
