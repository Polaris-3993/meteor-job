import { VZ } from '/imports/startup/both/namespace';
import './project-task-activity.html';
import './create-edit-project-task/create-edit-project-task';
import './tasks/tasks';

Template.projectTasksActivity.onCreated(function () {
    var self = this;
    var tasksType = this.data.tasks;
    var templateName;
    if (tasksType == 'assigned') {
        templateName = 'assignedTasks';
    }
    else if (tasksType == 'in-review') {
        templateName = 'inReview';
    }
    else if (tasksType == 'all') {
        templateName = 'allProjectTasks';
    }
    else if (tasksType == 'completed') {
        templateName = 'compleatedTasks';
    }
    else {
        templateName = 'allProjectTasks'
    }
    this.currentTab = new ReactiveVar(templateName);
    this.autorun(function () {
        var data = Template.currentData();
        var projectId = data.project && data.project._id;
        self.subscribe('tasksCounts', projectId);
    });
});
Template.projectTasksActivity.onRendered(function () {
    this.$('ul.tabs').tabs();
    this.$('.dropdown-button').dropdown();

    $(document).on('click', 'li.action .dropdown-content', function (e) {
        e.stopPropagation();
    });
});

Template.projectTasksActivity.helpers({
    tab: function () {
        return Template.instance().currentTab.get();
    },
    isTabSelected: function (tabName) {
        var tasks = Router.current().params.query.tasks;
        return tabName == tasks ? 'active' : '';
    },
    projectAssignedUsers: function () {
        var assignedUsersIds = this.project && this.project.assignedUsersIds || [];
        return Meteor.users.find({_id: {$in: assignedUsersIds}}).fetch() || [];
    },
    canEditProject: function () {
        var projectId = this.project && this.project._id;
        return VZ.canUser('editProject', Meteor.userId(), projectId);
    },
    allTaskCount: function () {
        return Counts.get('all');
    },
    assignedTaskCount: function () {
        return Counts.get('assigned');
    },
    reviewTaskCount: function () {
        return Counts.get('in-review');
    },
    completedTasksCount: function () {
        return Counts.get('completed');
    }
});

Template.projectTasksActivity.events({
    'click .sub-tab li': function (event, tmpl) {
        event.preventDefault();
        var currentTab = $(event.target).closest('li');
        var templateName = currentTab.data('template');
        var id = $(currentTab).prop('id');
        var projectId = Router.current().params.id;
        var tabName = Router.current().params.tab;

        tmpl.currentTab.set(templateName);
        Router.go('projectDashboard', {id: projectId, tab: tabName}, {query: {'tasks': id}});
    },
    'click #project-users': function (event, tmpl) {
        event.preventDefault();
        var projectId = tmpl.data.project._id;
        var parentNode = $('body')[0],
            modalData = {
                projectId: projectId
            };
        Blaze.renderWithData(Template.assignUsersToProjectModal, modalData, parentNode);
    }
});
