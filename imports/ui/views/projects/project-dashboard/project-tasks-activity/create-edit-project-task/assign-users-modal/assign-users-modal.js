import { VZ } from '/imports/startup/both/namespace';
import { Projects } from '/imports/api/projects/projects';
import { Tasks } from '/imports/api/tasks/tasks';
import './assign-users-modal.html';

Template.assignUsersModal.onCreated(function () {
    var self = this;
    this.assignedToTaskUsersIds = new ReactiveVar([]);
    this.canBeAssignedUsersIds = new ReactiveVar([]);
    this.searchString = new ReactiveVar('');

    this.setTaskUsers = function (taskId, projectId, newTaskUserIds) {
        var project = Projects.findOne({_id: projectId});
        var assignedUsersIds = project && project.assignedUsersIds || [];
        var users = {};
        if (taskId && taskId != 'new-task') {
            var task = Tasks.findOne({_id: taskId});
            var membersIds = task && task.membersIds || [];

            var canBeAssignedIds = _.difference(assignedUsersIds, membersIds);
            users.assignedToTaskUsersIds = membersIds || [];
            users.canBeAssignedUsersIds = canBeAssignedIds || [];
        }
        else if(taskId && taskId == 'new-task'){
            var canBeAssignedIdsNew = _.difference(assignedUsersIds, newTaskUserIds);
            users.assignedToTaskUsersIds = newTaskUserIds || [];
            users.canBeAssignedUsersIds = canBeAssignedIdsNew || [];
        }
        else {
            users.assignedToTaskUsersIds = [];
            users.canBeAssignedUsersIds = assignedUsersIds || [];
        }

        self.assignedToTaskUsersIds.set(users.assignedToTaskUsersIds);
        self.canBeAssignedUsersIds.set(users.canBeAssignedUsersIds);
    };

    this.autorun(function () {
        var data = Template.currentData();
        var projectId = data.projectId;
        var taskId = data.taskId;
        var newTaskUserIds = data.newTaskUserIdsVar.get();
        self.setTaskUsers(taskId, projectId, newTaskUserIds);
    });

    this.autorun(function () {
        self.assignedToTaskUsersIds.get();
        self.canBeAssignedUsersIds.get();
    });
});
Template.assignUsersModal.onRendered(function () {
    var self = this;

    this.$('.modal').modal();
    this.$('.modal').modal('open');
    $('.lean-overlay').on('click', function () {
        removeTemplate(self.view);
    });
    document.addEventListener('keyup', function (e) {
        if (e.keyCode == 27) {
            removeTemplate(self.view);
        }
    });
});
Template.assignUsersModal.onDestroyed(function () {
    $('.lean-overlay').remove();
});

Template.assignUsersModal.helpers({
    assignedUsers: function () {
        var tmpl = Template.instance();
        var assignedToTaskUsersIds = tmpl.assignedToTaskUsersIds.get();
        var canBeAssignedUsersIds = tmpl.canBeAssignedUsersIds.get();
        var searchString = tmpl.searchString.get();
        var regex = new RegExp(searchString, 'gi');

        var assignedToTaskUsers = Meteor.users.find({
            _id: {$in: assignedToTaskUsersIds},
            $or: [{'profile.fullName': {$regex: regex}}, {'emails.address': {$regex: regex}}]
        }, {fields: {profile: 1, emails: 1}}).fetch();

        var canBeAssignedUsers = Meteor.users.find({
            _id: {$in: canBeAssignedUsersIds},
            $or: [{'profile.fullName': {$regex: regex}}, {'emails.address': {$regex: regex}}]
        }, {fields: {profile: 1, emails: 1}}).fetch();

        return {assignedToTaskUsers: assignedToTaskUsers, canBeAssignedUsers: canBeAssignedUsers};
    }
});

Template.assignUsersModal.events({
    'click #remove-user': function (event, tmpl) {
            var selectedUserId = this._id;
            var taskId = tmpl.data.taskId;
            var projectId = tmpl.data.projectId;
            var assignedToTaskUsersIds = _.clone(tmpl.assignedToTaskUsersIds.get());
            if (taskId == 'new-task') {
                tmpl.data.onUserAssignRemoveUserCb(selectedUserId, 'remove');
            }
            else {
                Meteor.call('removeUserFromTask', selectedUserId, taskId, projectId, function (error, result) {
                    if (!error) {
                        assignedToTaskUsersIds = _.reject(assignedToTaskUsersIds, function (userId) {
                            return userId == selectedUserId;
                        });
                        tmpl.assignedToTaskUsersIds.set(assignedToTaskUsersIds);
                    }
                    else {
                        VZ.notify(error.message);
                    }
                });
            }
    },
    'click #add-user': function (event, tmpl) {
            var selectedUserId = this._id;
            var taskId = tmpl.data.taskId;
            var projectId = tmpl.data.projectId;
            var canBeAssignedUsersIds = _.clone(tmpl.canBeAssignedUsersIds.get());
            if (taskId == 'new-task') {
                tmpl.data.onUserAssignRemoveUserCb(selectedUserId, 'assign');
            }
            else {
                Meteor.call('addUserToTask', selectedUserId, taskId, projectId, function (error, result) {
                    if (!error) {
                        canBeAssignedUsersIds = _.reject(canBeAssignedUsersIds, function (userId) {
                            return userId == selectedUserId;
                        });
                        tmpl.canBeAssignedUsersIds.set(canBeAssignedUsersIds);
                    }
                    else {
                        VZ.notify(error.message);
                    }
                });
            }
    },
    'input #search-string': _.debounce(function (event, tmpl) {
        setTimeout(function () {
            var searchString = $(event.currentTarget).val();
            tmpl.searchString.set(searchString);
        }, 50)
    }, 100)
});

var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};