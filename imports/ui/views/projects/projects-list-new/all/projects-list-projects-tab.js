/**
 * Created by yukinohito on 3/25/17.
 */
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import { Projects } from '/imports/api/projects/projects';
import './projects-list-projects-tab.html';

import { projectsSubs } from '/imports/startup/client/subManagers';
Template.projectsListProjectsTab.onCreated(function () {
    this.query = new ReactiveVar({archived: false});
    this.ready = new ReactiveVar(false);
    this.autorun(() => {
        let companyId = Session.get('companyId');
        this.subscribe('timeEntries');
    });
    this.autorun(() => {
        let companyId = Session.get('companyId');
        let query = this.query.get();
        let projectsSub = projectsSubs.subscribe('Projects', '', companyId, query);
        if (projectsSub.ready()) {
            this.ready.set(true);
        }
    });

    this.activeFilter = new ReactiveVar('Most recent');
    this.limit = new ReactiveVar(10);
});

Template.projectsListProjectsTab.onRendered(function () {
    this.autorun(() => {
        if (this.ready.get()) {
            Meteor.defer(function () {
                $('.collapsible').collapsible();
            });
        }
    });
    this.$('.dropdown-button').dropdown({});
    this.$('.collapsible').collapsible();
    $('#table_search .search').click(function () {
        $(this).parent('#table_search').addClass('active');
    });
    $('#table_search .close').click(function () {
        $(this).parent('#table_search').removeClass('active');
    });
});

Template.projectsListProjectsTab.helpers({
    ready(){
        return Template.instance().ready.get();
    },
    getActiveFilter() {
        return Template.instance().activeFilter.get();
    },
    getProjects() {
        const template = Template.instance();
        const limit = template.limit.get();
        const filter = template.activeFilter.get();
        const query = template.query.get();
        let projects = Projects.find(query).fetch();
        projects.forEach(project => {
            const assignedUsersIds = project.assignedUsersIds || [];
            const usersInvolved = Meteor.users.find({_id: {$in: assignedUsersIds}}).fetch();
            project.workersCount = usersInvolved.reduce((sum, currentUser) => {
                if (currentUser.roles[project._id].indexOf('project-worker') !== -1) {
                    return ++sum;
                } else {
                    return sum;
                }
            }, 0);
        });
        if (filter === 'Most recent') {
            projects.sort((a, b) => b.updatedAt - a.updatedAt);
        } else if (filter === 'Most popular') {
            projects.sort((a, b) => b.workersCount - a.workersCount);
        } else if (filter === 'Date added') {
            projects.sort((a, b) => b.createdAt - a.createdAt);
        } else {
            throw new Meteor.Error(`Wrong filter ${template.activeFilter.get()}`);
        }
        return projects.splice(0, limit);
    },
    moreLeft() {
        const template = Template.instance();
        const limit = template.limit.get();
        const filter = template.activeFilter.get();
        const projectsCount = Projects.find({
            archived: false
        }).count();
        return projectsCount > limit;
    }
});

Template.projectsListProjectsTab.events({
    'click .filterItem': function (event, template) {
        const newActiveFilter = event.target.innerText;
        template.activeFilter.set(newActiveFilter);
    },
    'click .btn-load-more': function (event, template) {
        template.limit.set(template.limit.get() + 10);
    },
    'input #search-filter': function (event, tmpl) {
        event.preventDefault();
        let value = tmpl.$('#search-filter').val().trim();
        let query = _.clone(tmpl.query.get());
        let reg = {$regex: value, $options: 'gi'};
        query.name = reg;
        tmpl.query.set(query);
    },
    'click .add-new': function(event, template) {
        ga('send', 'event', 'create-project', 'vezio-work');
        return true;
    }
});
