import { VZ } from '/imports/startup/both/namespace';
import './project-view-time-entries.html';

Template.projectViewTimeEntries.onCreated(function () {
    var selectedUsersIds = this.data.selectedUsersIds;
    this.checkedUsersIds = new ReactiveArray(selectedUsersIds);

    var self = this;
    // when selected users changes - change route
    this.autorun(function () {
        var checkedUsersIds = self.checkedUsersIds.list().array();
        var selectedUsersIdsString = checkedUsersIds.join(',');
        if (selectedUsersIdsString) {
            Router.go('viewProjectTimeEntries', {
                id: self.data.project._id,
                selectedUsersIds: selectedUsersIdsString
            });
        }
    });
});

Template.projectViewTimeEntries.onRendered(function () {
});

Template.projectViewTimeEntries.helpers({
    canSeeFilterByUsers: function () {
        var projectId = this.project._id;

        return VZ.canUser('seeFilterByUserInProject', Meteor.userId(), projectId);
    },

    isCheckedUserInFilter: function (userId) {
        return !!_.find(Template.instance().data.selectedUsersIds, function (selectedUserId) {
            return selectedUserId == userId;
        });
    },

    timeEntriesFilterParams: function () {
        var query = {
            projectId: this.project._id
        };

        var tmpl = Template.instance();
        var usersIds = tmpl.checkedUsersIds.list().array();
        if (usersIds.length > 0) {
            query.userId = {$in: usersIds}
        }

        return query;
    },

    assignedUsersToThisProject: function () {
        var assignedUsersIds = this.project.assignedUsersIds;
        return Meteor.users.find({_id: {$in: assignedUsersIds}});
    }
});

Template.projectViewTimeEntries.events({
    'change .filter-user-checkbox': function (event, tmpl) {
        var userId = event.target.id;
        var checked = event.target.checked;

        if (checked) {
            tmpl.checkedUsersIds.push(userId);
        } else {
            tmpl.checkedUsersIds.remove(userId);
        }
    }
});