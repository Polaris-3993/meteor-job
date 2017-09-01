import { VZ } from '/imports/startup/both/namespace';
import { Projects } from '/imports/api/projects/projects';
import { Contracts } from '/imports/api/contracts/contracts';
import './assign-users-to-project-modal.html';

Template.assignUsersToProjectModal.onCreated(function () {
    var self = this;
    this.assignedToTaskUsersIds = new ReactiveVar([]);
    this.canBeAssignedUsersIds = new ReactiveVar([]);
    this.searchString = new ReactiveVar('');

    this.setTaskUsers = function (projectId) {
        var project = Projects.findOne({_id: projectId});
        var assignedUsersIds = project && project.assignedUsersIds || [];
        var ownerId = project && project.ownerId;
        var users = {};
        var ownerContracts = Contracts.find({employerId: ownerId}).fetch();
        var contractedUsersIds = _.map(ownerContracts, function (contract) {
            return contract.workerId;
        });
        contractedUsersIds.push(ownerId);
        var canBeAssignedIds = _.difference(contractedUsersIds, assignedUsersIds);

        users.assignedToTaskUsersIds = assignedUsersIds || [];
        users.canBeAssignedUsersIds = canBeAssignedIds || [];

        self.assignedToTaskUsersIds.set(users.assignedToTaskUsersIds);
        self.canBeAssignedUsersIds.set(users.canBeAssignedUsersIds);
    };
    this.autorun(function () {
        var data = Template.currentData();
        var projectId = data.projectId;
        self.setTaskUsers(projectId);
    });

    this.autorun(function () {
        self.assignedToTaskUsersIds.get();
        self.canBeAssignedUsersIds.get();
    });
});
Template.assignUsersToProjectModal.onRendered(function () {
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
    this.autorun(function () {
        self.assignedToTaskUsersIds.get();
        self.canBeAssignedUsersIds.get();
    })
});
Template.assignUsersToProjectModal.onDestroyed(function () {
    $('.lean-overlay').remove();
});

Template.assignUsersToProjectModal.helpers({
    assignedUsers: function () {
        var assignedToTaskUsersIds = Template.instance().assignedToTaskUsersIds.get();
        var canBeAssignedUsersIds = Template.instance().canBeAssignedUsersIds.get();
        var searchString = Template.instance().searchString.get();
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

Template.assignUsersToProjectModal.events({
    'click #remove-user-from-project': function (event, tmpl) {
        var selectedUserId = this._id;
        var projectId = tmpl.data.projectId;
        var assignedToTaskUsersIds = _.clone(tmpl.assignedToTaskUsersIds.get());

        Meteor.call('removeUserFromProject', selectedUserId, projectId, function (error, result) {
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
    },
    'click #add-user-to-project': function (event, tmpl) {
        var selectedUserId = this._id;
        var projectId = tmpl.data.projectId;
        var canBeAssignedUsersIds = _.clone(tmpl.canBeAssignedUsersIds.get());

        Meteor.call('addUserToProject', selectedUserId, projectId, function (error, result) {
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
    },
    'input #search-string': _.debounce(function (event, tmpl) {
        setTimeout(function () {
            var searchString = $(event.currentTarget).val();
            tmpl.searchString.set(searchString);
        },20)
    },100)
});

var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};