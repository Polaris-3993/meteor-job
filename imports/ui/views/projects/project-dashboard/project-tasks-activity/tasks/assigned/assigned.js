import { VZ } from '/imports/startup/both/namespace';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Tasks } from '/imports/api/tasks/tasks';

import './assigned.html';
import { tasksSubs } from '/imports/startup/client/subManagers';

Template.assignedTasks.onCreated(function () {
    var self = this;
    this.query = new ReactiveVar({});
    this.params = new ReactiveVar({});
    this.taskId = new ReactiveVar('');
    this.timeZones = new ReactiveVar([]);
    this.newTaskUserIds = new ReactiveVar([]);
    this.newTaskFiles = new ReactiveVar([]);

    this.getUserCoordinates = function (projectId) {
        var tasks = Tasks.find({projectId: projectId, status: {$nin: ['In-review', 'Closed']}}).fetch();
        var tasksUsersIds = _.map(tasks, function (task) {
            return task.membersIds;
        });
        tasksUsersIds = _.union(_.flatten(tasksUsersIds, true));
        var users = Meteor.users.find({_id: {$in: tasksUsersIds}}).fetch();
        var usersWitlLocation = _.filter(users, function (user) {
            var userProfile = user.profile || {};
            return _.has(userProfile, 'location');
        });
        Meteor.call('getTimeZoneNameFromCoordinatesForUsers', usersWitlLocation, function (error, result) {
            if (!error) {
                self.timeZones.set(result);
            }
        });
    };
    this.autorun(function () {
        var data = Template.currentData();
        var query = {};
        query.projectId = data.project._id;
        query.archived = false;
        query.membersIds = Meteor.userId();
        query.status = {$nin: ['In-review', 'Closed']};
        self.params.set({sort: {createdAt: -1}});
        self.query.set(query);
    });
    this.autorun(function () {
        var taskId = Router.current().params.query.task;
        if (taskId && taskId != 'new-task') {
            self.taskId.set(taskId);
        }
    });
    this.autorun(function () {
        var taskId = self.taskId.get();
        var data = Template.currentData();
        var projectId = data.project._id;
        var tasksTab = Router.current().params.query.tasks;
        Tasks.find({projectId: projectId, membersIds: Meteor.userId()}).observe({
            changed: function (newTask, oldTask) {
                var statusChnaged = oldTask.status == newTask.status;
                if(taskId == oldTask._id && !statusChnaged){
                    self.taskId.set('');
                    Router.go('projectDashboard', {id: projectId, tab: 'tasks'}, {query: {tasks: tasksTab}});
                }
            }
        });
        self.getUserCoordinates(projectId);
    });
    this.autorun(function () {
        var query = self.query.get();
        var params = self.params.get();
        tasksSubs.subscribe('tasksByType', query, params);
    });
});

Template.assignedTasks.onRendered(function () {
    this.$('ul.tabs').tabs();
    this.$('.dropdown-button').dropdown();
});
Template.assignedTasks.helpers({
    assignedTasks: function () {
        var query = Template.instance().query.get();
        var params = Template.instance().params.get();
        return Tasks.find(query, params).fetch();
    },
    taskTimeTracked: function () {
        var timeTracked = 0;
        var entryName = this.taskKey + ': ' + this.name;
        var taskId = this._id;
        var projectId = this.projectId;
        var entries = TimeEntries.find({
            projectId: projectId,
            $or: [{taskId: taskId},{message: entryName}]
        }).fetch();
        _.each(entries, function (entry) {
            timeTracked += moment(entry.endDate).diff(entry.startDate, 'second');
        });
        return timeTracked;
    },
    taskMembersCount: function (membersIds) {
        return membersIds && membersIds.length || 0;
    },
    taskId: function () {
        return Template.instance().taskId.get();
    },
    task: function () {
        var taskId = Template.instance().taskId.get();
        return taskId ? Tasks.findOne({_id: taskId}) : {};
    },
    formatTime: function (timeToFormat) {
        return moment(new Date(timeToFormat)).fromNow();
    },
    membersCount: function () {
        if(this.membersIds){
            return this.membersIds.length;
        }
        return 0;
    },
    taskFilesCount: function () {
        if(this.taskFiles){
            return this.taskFiles.length;
        }
        return 0;
    },
    isTaskSelected: function (id) {
        var tasksTab = Template.instance().taskId.get();
        return tasksTab == id ? 'active' : '';
    },
    taskHaveUsers: function () {
        return this.membersIds && this.membersIds.length > 0;
    },
    isInReview: function () {
        return this.status == 'In-review';
    },
    isTaskCompleted: function () {
        return this.status == 'Closed';
    },
    isTaskOpen: function () {
        return this.status == 'Opened';
    },
    userTaskRole: function (isRole) {
        var membersIds = this.membersIds;
        var ownerId = this.ownerId == Meteor.userId();
        var isTaskMember = _.find(membersIds, function (memberId) {
            return memberId == Meteor.userId();
        });
        if(isRole == 'member'){
            return isTaskMember && !ownerId;
        }
        else if(isRole == 'owner'){
            return !isTaskMember && ownerId;
        }
        else if(isRole == 'ownerAndMember'){
            return isTaskMember && ownerId;
        }
        else {
            return false;
        }
    },
    isSortedBy: function (sortParam) {
        var params = Template.instance().params.get();
        return _.has(params.sort, sortParam);
    },
    userUpdated: function () {
        var editedBy = this.editedBy || '';
        var user = Meteor.users.findOne({_id: editedBy});
        return user && user.profile && user.profile.fullName;
    },
    userProfile: function () {
        var id = this.toString();
        var timeZones = Template.instance().timeZones.get();
        var user = Meteor.users.findOne({_id: id});
        var profile = user && user.profile;
        if (profile) {
            var userProfile = {
                photo: profile.photo.large,
                fullName: profile.fullName,
                location: profile.location && profile.location.locality + ', ' + profile.location.country || '',
                lastOnline: profile.lastOnline && profile.lastOnline.toString() || false,
                status: profile.online || false
            };
            _.each(timeZones, function (timeZone) {
                if(timeZone.userId == user._id){
                    userProfile.localTime = moment.tz(timeZone.timeZoneId).format('hh:mm a');
                }
            });
            return userProfile;
        }
    },
    totalSpent: function () {
        var oneHour = 1000 * 60 * 60;
        var totalSpent = 0;
        var taskId = this._id;
        var timeEntries = TimeEntries.find({taskId: taskId, _isActive: false}).fetch();
        timeEntries = _.filter(timeEntries, function (entry) {
            return _.has(entry, 'contractId');
        });
        _.each(timeEntries, function (entry) {
            var timeEntryDuration = entry.endDate - entry.startDate;
            var earned = timeEntryDuration * entry.paymentRate / oneHour;
            totalSpent += earned;
        });
        totalSpent = totalSpent.toFixed(2);
        return totalSpent;
    }
});

Template.assignedTasks.events({
    'click .tab-single': function (event, tmpl) {
        event.preventDefault();
        var taskId = $(event.currentTarget).prop('id').replace('task-item-','');
        var projectId = Router.current().params.id;
        var tabName = Router.current().params.tab;
        var tasksTab = Router.current().params.query.tasks;
        tmpl.taskId.set(taskId);

        if(taskId && taskId != 'new-task'){
            Router.go('projectDashboard', {id: projectId, tab: tabName}, {query: {tasks: tasksTab, task: taskId}});
        }
        else {
            Router.go('projectDashboard', {id: projectId, tab: tabName}, {query: {tasks: tasksTab}});

        }
    },
    'click #task-users-count': function (event, tmpl) {
        event.preventDefault();
        var projectId = tmpl.data.project._id;
        var taskId = tmpl.taskId.get();
        var newTaskUserIds = tmpl.newTaskUserIds.get();
        var newTaskUserIdsVar = tmpl.newTaskUserIds;
        var parentNode = $('body')[0],
            onUserAssignRemoveUserCb = function (userId, action) {
                if (action == 'assign') {
                    newTaskUserIds.push(userId);
                    tmpl.newTaskUserIds.set(newTaskUserIds);
                }
                else if (action == 'remove') {
                    newTaskUserIds = _.reject(newTaskUserIds, function (id) {
                        return id == userId;
                    });
                    tmpl.newTaskUserIds.set(newTaskUserIds);
                }
            },
            modalData = {
                projectId: projectId,
                taskId: taskId,
                newTaskUserIdsVar: newTaskUserIdsVar,
                onUserAssignRemoveUserCb: onUserAssignRemoveUserCb
            };
        Blaze.renderWithData(Template.assignUsersModal, modalData, parentNode);
    },
    'click #task-files-count': function (event, tmpl) {
        event.preventDefault();
        var projectId = tmpl.data.project._id;
        var taskId = tmpl.taskId.get();
        var newTaskFiles = tmpl.newTaskFiles.get();
        var newTaskFilesVar = tmpl.newTaskFiles;
        var parentNode = $('body')[0],
            onAddFilesCb = function (file) {
                newTaskFiles.push(file);
                tmpl.newTaskFiles.set(newTaskFiles);
            },
            modalData = {
                projectId: projectId,
                taskId: taskId,
                newTaskFilesVar: newTaskFilesVar,
                onAddFilesCb: onAddFilesCb
            };
        Blaze.renderWithData(Template.taskAttachmentsModal, modalData, parentNode);
    },
    'click #review-task': function (event, tmpl) {
        var taskId = this._id;
        var tasksTab = Router.current().params.query.tasks;
        var projectId = Router.current().params.id;

        Meteor.call('changeTaskStatus', taskId, 'In-review', function (error, result) {
            if(!error){
                tmpl.taskId.set('');
                Router.go('projectDashboard', {id: projectId, tab: 'tasks'}, {query: {tasks: tasksTab}});
            }
            else {
                VZ.notify(error.message);
            }
        });
    },
    'click #complete-task': _.debounce(function (event, tmpl) {
        var taskId = this._id;
        var tasksTab = Router.current().params.query.tasks;
        var projectId = Router.current().params.id;

        Meteor.call('changeTaskStatus', taskId, 'Closed', function (error, result) {
            if(!error){
                tmpl.taskId.set('');
                Router.go('projectDashboard', {id: projectId, tab: 'tasks'}, {query: {tasks: tasksTab}});
            }
            else {
                VZ.notify(error.message);
            }
        });
    },100),
    'click #deny-task': _.debounce(function (event, tmpl) {
        var taskId = this._id;
        var tasksTab = Router.current().params.query.tasks;
        var projectId = Router.current().params.id;

        Meteor.call('changeTaskStatus', taskId, 'Opened', function (error, result) {
            if(!error){
                tmpl.taskId.set('');
                Router.go('projectDashboard', {id: projectId, tab: 'tasks'}, {query: {tasks: tasksTab}});
            }
            else {
                VZ.notify(error.message);
            }
        });
    },100),
    'change input[type=radio]': function (event, tmpl) {
        var id = tmpl.$(event.target).prop('id');
        if (id == 'last-updated') {
            tmpl.params.set({sort: {editedAt: -1}});
        }
        else if (id == 'alphabetically') {
            tmpl.params.set({sort: {name: 1}});
        }
        else if (id == 'date-created') {
            tmpl.params.set({sort: {createdAt: -1}});
        }
    },
    'input #task-name': function (event, tmpl) {
        event.preventDefault();
        var searchString = tmpl.$(event.currentTarget).val();
        var query = tmpl.query.get();
        if (searchString != '') {
            query.name = {$regex: searchString, $options: 'gi'};
        }
        else {
            query = _.omit(query, 'name');
        }
        tmpl.query.set(query);
    }
});
