import { Projects } from '/imports/api/projects/projects';
import './project-search.html';

Template.projectsSearch.helpers({
    projects: function () {
        return Projects.find().fetch();
    }
});