import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Contracts } from '/imports/api/contracts/contracts';
import './dashboard-card-active.html';
import { timeEntriesSubs } from '/imports/startup/client/subManagers';

Template.dashboardCardActive.onCreated(function () {
    var self = this;
    this.query = new ReactiveVar({_id: 'dummyId'});
    this.autorun(function () {
        var data = Template.currentData();
        var companyId = Session.get('companyId');

        if (data.content == 'usersActiveTasks') {
            var subscribtion = timeEntriesSubs.subscribe('ownerContractsActiveTimeEntries', true, companyId);
            if (subscribtion.ready()) {
                var contracts = Contracts.find({employerId: Meteor.userId()}).fetch();
                var workersIds = _.map(contracts, function (contract) {
                    return contract.workerId;
                });
                var users = Meteor.users.find({_id: {$in: workersIds}}).fetch();

                var usersLastEntries = _.map(users, function (user) {
                    if (user.profile && user.profile.lastWorkedEntryId) {
                        return {userId: user._id, lastWorkedEntryId: user.profile.lastWorkedEntryId};
                    }
                    return {};
                });

                var usersLastTimeEntriesTasks = _.map(usersLastEntries, function (obj) {
                    var lastTimeEntry = TimeEntries.findOne({_id: obj.lastWorkedEntryId});
                    if (lastTimeEntry && lastTimeEntry.taskId) {
                        var lastTaskId = lastTimeEntry && lastTimeEntry.taskId;
                        return {userId: obj.userId, entry: lastTimeEntry, lastTaskId: lastTaskId};
                    }
                    return {};
                });

                workersIds.push(Meteor.userId());
                var usersTimeEntries = TimeEntries.find({
                    userId: {$in: workersIds},
                    _isActive: true
                }).fetch();
                _.each(usersTimeEntries, function (entry) {
                    _.each(usersLastTimeEntriesTasks, function (entryLast) {
                        if(entry.userId == entryLast.userId){
                            usersLastTimeEntriesTasks= _.reject(usersLastTimeEntriesTasks, function(userEntry){
                                return userEntry.userId == entryLast.userId;
                            });
                        }
                    });
                });
                var taskIds = _.map(usersTimeEntries, function (timeEntry) {
                    if (timeEntry.taskId) {
                        return timeEntry.taskId;
                    }
                });
                self.query.set({_id: {$in: taskIds}, usersLastTimeEntriesTasks:usersLastTimeEntriesTasks});
            }
        }
    });
});

Template.dashboardCardActive.onRendered(function () {
    this.$('.dropdown-button').dropdown();
});

Template.dashboardCardActive.helpers({
    query: function () {
        var query = Template.instance().query.get();
        return query;
    },
    contractedUsers: function () {
        var contracts = Contracts.find({employerId: Meteor.userId()}).fetch();
        var workersIds = _.map(contracts, function (contract) {
            return contract.workerId;
        });
        var contractedUsers = Meteor.users.find({_id: {$in: workersIds}}).fetch();
        return contractedUsers;
    },
    showUsers: function () {
        var tmpl = Template.instance();
        var content = tmpl.data.content;
        return content == 'dashboardTasksList' || content == 'usersActiveTasks';
    }
});

Template.dashboardCardActive.events({
    'change input[type=radio]': function (event, tmpl) {
        event.preventDefault();
        var name = event.target.className;
        var content = tmpl.data.content;
        if (content == 'usersActiveTasks') {
            if (name == 'assigned-to-me') {
                var myTimeEntry = TimeEntries.findOne({
                    userId: Meteor.userId(),
                    _isActive: true
                });
                var taskId = myTimeEntry && myTimeEntry.taskId;
                tmpl.query.set({_id: taskId});
            }
            else if (name == 'all-active-tasks') {
                var contracts = Contracts.find({employerId: Meteor.userId()}).fetch();
                var workersIds = _.map(contracts, function (contract) {
                    return contract.workerId;
                });
                // debugger;
                var users = Meteor.users.find({_id: {$in: workersIds}}).fetch();

                var usersLastEntries = _.map(users, function (user) {
                    if (user.profile && user.profile.lastWorkedEntryId) {
                        return {userId: user._id, lastWorkedEntryId: user.profile.lastWorkedEntryId};
                    }
                    return {};
                });

                var usersLastTimeEntriesTasks = _.map(usersLastEntries, function (obj) {
                    var lastTimeEntry = TimeEntries.findOne({_id: obj.lastWorkedEntryId});
                    if (lastTimeEntry && lastTimeEntry.taskId) {
                        var lastTaskId = lastTimeEntry && lastTimeEntry.taskId;
                        return {userId: obj.userId, entry: lastTimeEntry, lastTaskId: lastTaskId};
                    }
                    return {};
                });

                workersIds.push(Meteor.userId());
                var usersTimeEntries = TimeEntries.find({
                    userId: {$in: workersIds},
                    _isActive: true
                }).fetch();


                _.each(usersTimeEntries, function (entry) {
                    _.each(usersLastTimeEntriesTasks, function (entryLast) {
                        if(entry.userId == entryLast.userId){
                            usersLastTimeEntriesTasks= _.reject(usersLastTimeEntriesTasks, function(userEntry){
                                return userEntry.userId == entryLast.userId;
                            });
                        }
                    });
                });

                var taskIds = _.map(usersTimeEntries, function (timeEntry) {
                    if (timeEntry.taskId) {
                        return timeEntry.taskId;
                    }
                });
                tmpl.query.set({_id: {$in: taskIds}, usersLastTimeEntriesTasks:usersLastTimeEntriesTasks});
            }
            else {
                var user = Meteor.users.findOne({_id: name});
                var lastTimeEntryId = user.profile && user.profile.lastWorkedEntryId;
                var userTimeEntry = TimeEntries.findOne({userId: name, _isActive: true});
                var lastTimeEntry = TimeEntries.findOne({_id: lastTimeEntryId});
                var userTaskId = userTimeEntry && userTimeEntry.taskId;
                var query = {userId: name};

                if (userTaskId) {
                    query.userTaskId = userTaskId;
                }
                if (lastTimeEntry && lastTimeEntry.taskId) {
                    query.lastTaskId = lastTimeEntry.taskId;
                    query.endDate = lastTimeEntry.endDate;
                }
                tmpl.query.set(query);
            }
        }
    },
    'click .dropdown-content': function (event, tmpl) {
        event.stopPropagation();
    }
});
