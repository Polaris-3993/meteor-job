import { Projects } from '/imports/api/projects/projects';
import './create-edit-project/create-edit-project';
import './data-table-templates/data-table-templates';
import './project-dashboard/project-dashboard';
import './project-view/project-view';
import './projects-list-new/projects-list-new';
import './projects-main.html';

Template.projectsMain.onCreated(function () {
});

Template.projectsMain.onRendered(function () {
});

Template.projectsMain.onDestroyed(function () {
});

Template.projectsMain.helpers({
    projects: function () {
        var projects =  Projects.find({}).fetch();
        return _.sortBy(projects, function (project) {
            return project.name.toLowerCase();
        });
    }
});

Template.projectsMain.events({});
