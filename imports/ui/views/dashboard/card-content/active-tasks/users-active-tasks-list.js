import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Projects } from '/imports/api/projects/projects';

Template.usersActiveTasksList.helpers({
    taskTimeTrackedActive: function () {
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
    totalSpentActive: function () {
        var oneHour = 1000 * 60 * 60;
        var totalSpent = 0;
        var taskId = this._id;
        var timeEntries = TimeEntries.find({taskId: taskId}).fetch();
        timeEntries = _.filter(timeEntries, function (entry) {
            return _.has(entry, 'contractId');
        });
        _.each(timeEntries, function (entry) {
            var timeEntryDuration;
            if(entry.endDate){
                timeEntryDuration = entry.endDate - entry.startDate;
            }
            else {
                timeEntryDuration = new Date() - entry.startDate;
            }
            var earned = timeEntryDuration * entry.paymentRate / oneHour;
            totalSpent += earned;
        });

        totalSpent = totalSpent.toFixed(2);
        return totalSpent;
    },
    trakingUser: function () {
        if(this.trakingUserId){
            return Meteor.users.findOne(this.trakingUserId);
        }
        else {
            return Meteor.users.findOne(this.ownerId);
        }
    },
    taskOwner: function () {
        if(this.workerId){
            return Meteor.users.findOne(this.workerId);
        }
        else {
            return Meteor.users.findOne(this.ownerId);
        }
    },
    taskOwnerAvatar: function () {
        var owner = Meteor.users.findOne(this.ownerId);
        if (!owner || !owner.profile) {
            return;
        }
        if (!owner.profile.photo || !owner.profile.photo.large) {
            return '/images/default-lockout.png'
        }

        return owner.profile.photo.large;
    },
    relatedProject: function () {
        var projectId = this.projectId;
        var project = Projects.findOne({_id: projectId});
        // console.log(project);
        return project;
    },
    statusToClass: function () {
        return this.status.split(' ').join('-').toLowerCase();
    }
});

Template.usersActiveTasksList.events({
    'click #task-name': function (event, tmpl) {
        event.preventDefault();
        var taskId = this._id;
        var projectId = this.projectId;
        Session.set('taskId', taskId);
        Router.go('projectDashboard', {id: projectId});
    }
});
