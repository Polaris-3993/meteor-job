import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Contracts } from '/imports/api/contracts/contracts';
import './spendings-earnings-list.html';
import './total-time-money-list';
import { timeEntriesSubs } from '/imports/startup/client/subManagers';


Template.spendingsEarningsList.onCreated(function () {
    var self = this;
    this.ready = new ReactiveVar(false);
    this.autorun(function () {
        var data = Template.currentData();
        var companyId = Session.get('companyId');
        if (data && data.title) {
            if (data.title == 'Spendings') {
                var spendingsSub = timeEntriesSubs.subscribe('entriesByProjectIdsAndUsers', companyId);
                if (spendingsSub.ready()) {
                    self.ready.set(true);
                }
            }
            else if (data.title == 'Earnings') {
                var earningsSub = timeEntriesSubs.subscribe('entriesByUserContracts');
                if (earningsSub.ready()) {
                    self.ready.set(true);
                }
            }
        }
    });

    this.getDayStartEndTime = function (yesterday) {
        var startOfDay;
        var endOfDay;
        if (yesterday) {
            startOfDay = moment().subtract(1, 'd').startOf('day').toDate();
            endOfDay = moment().subtract(1, 'd').endOf('day').toDate();
        } else {
            startOfDay = moment().startOf('day').toDate();
            endOfDay = moment().endOf('day').toDate();
        }
        return {
            startOfDay: startOfDay,
            endOfDay: endOfDay
        }
    };

    this.getWeekStartEndTime = function (isLastWeek) {
        var startOfWeek;
        var endOfWeek;
        if (isLastWeek) {
            startOfWeek = moment().subtract(1, 'week').startOf('isoweek').toDate();
            endOfWeek = moment().subtract(1, 'week').endOf('isoweek').toDate();
        }
        else {
            startOfWeek = moment().startOf('isoweek').toDate();
            endOfWeek = moment().endOf('isoweek').toDate();
        }
        return {
            startOfWeek: startOfWeek,
            endOfWeek: endOfWeek
        }
    };

    this.getMonthStartEndTime = function (isLastMonth) {
        var startOfMonth;
        var endOfMonth;

        if (isLastMonth) {
            startOfMonth = moment().subtract(1, 'month').startOf('month').toDate();
            endOfMonth = moment().subtract(1, 'month').endOf('month').toDate();
        }
        else {
            startOfMonth = moment().startOf('month').toDate();
            endOfMonth = moment().endOf('month').toDate();
        }
        return {
            startOfMonth: startOfMonth,
            endOfMonth: endOfMonth
        }
    };

    this.getTimeMoneySpend = function (timeEntries) {
        var oneHour = 1000 * 60 * 60;
        var timeTracked = 0;
        var totalSpent = 0;

        _.each(timeEntries, function (entry) {
            var timeEntryDuration = 0;
            if (entry.endDate) {
                timeTracked += moment(entry.endDate).diff(entry.startDate, 'second');
                timeEntryDuration = entry.endDate - entry.startDate;
            }
            else {
                timeTracked += moment(new Date()).diff(entry.startDate, 'second');
                timeEntryDuration = new Date() - entry.startDate;
            }

            var earned = timeEntryDuration * entry.paymentRate / oneHour;
            totalSpent += earned;
        });

        return {
            timeTracked: timeTracked,
            totalSpent: totalSpent.toFixed(2)
        }
    };

    this.getCountsForUsers = function (timeEntries) {
        var usersWithCounts = [];

        var users = _.groupBy(timeEntries, function (entry) {
            return entry.userId;
        });

        for (var userId in users) {
            var tasksWithCounts = [];
            if (users[userId].length == 0) {
                delete users[userId];
            }
            var tasks = _.groupBy(users[userId], function (entry) {
                return entry.taskId;
            });
            for (var taskId in tasks) {

                if (tasks[taskId].length == 0) {
                    delete tasks[taskId];
                }
                var taskCounts = self.getTimeMoneySpend(tasks[taskId]);
                if (taskCounts.totalSpent > 0) {
                    tasksWithCounts.push({taskId: taskId, taskCounts: taskCounts});
                }
            }
            var userCounts = self.getTimeMoneySpend(users[userId]);
            if (userCounts.totalSpent > 0) {
                usersWithCounts.push({userId: userId, userCounts: userCounts, userTaskCounts: tasksWithCounts});
            }
        }
        return usersWithCounts;
    };

    this.getCountsForTasks = function (timeEntries) {
        var usersWithCounts = [];
        var tasks = _.groupBy(timeEntries, function (entry) {
            return entry.taskId;
        });
        for (var taskId in tasks) {
            if (tasks[taskId].length == 0) {
                delete tasks[taskId];
            }
            var taskCounts = self.getTimeMoneySpend(tasks[taskId]);
            if (taskCounts.totalSpent > 0) {
                usersWithCounts.push({taskId: taskId, taskCounts: taskCounts});
            }
        }
        return usersWithCounts;
    };

    this.filterEntries = function (allTimeEntries, start, end) {
        allTimeEntries = _.filter(allTimeEntries, function (entry) {
            return entry.startDate >= start && entry.startDate <= end;
        });
        return allTimeEntries;
    };
});

Template.spendingsEarningsList.onRendered(function () {
    var self = this;
    self.autorun(function () {
       if(self.ready.get()){
           Meteor.defer(function () {
               $('.collapsible').collapsible();
           });
       }
    });
});

Template.spendingsEarningsList.helpers({
    totalCounts: function () {
        //TODO: refactor this helper
        var tmpl = Template.instance();
        var ready = tmpl.ready.get();
        if (ready) {

            var title = tmpl.data && tmpl.data.title;
            var userContracts;
            var contractedUsers;
            var contractedProjects;
            var allTimeEntries;

            var today = tmpl.getDayStartEndTime();
            var yesterday = tmpl.getDayStartEndTime(true);
            var thisWeek = tmpl.getWeekStartEndTime();
            var lastWeek = tmpl.getWeekStartEndTime(true);
            var month = tmpl.getMonthStartEndTime();
            var lastMonth = tmpl.getMonthStartEndTime(true);

            if (title == 'Spendings') {
                userContracts = Contracts.find({employerId: Meteor.userId()}).fetch();
                contractedUsers = _.map(userContracts, function (contract) {
                    return contract.workerId;
                });
                contractedProjects = _.map(userContracts, function (contract) {
                    return contract.projectIds;
                });
                contractedUsers = _.uniq(contractedUsers);
                contractedProjects = _.uniq(_.flatten(contractedProjects));
                allTimeEntries = TimeEntries.find({
                    userId: {$in: contractedUsers},
                    projectId: {$in: contractedProjects}
                }).fetch();
            }
            else if (title == 'Earnings') {
                userContracts = Contracts.find({workerId: Meteor.userId()}).fetch();
                contractedProjects = _.map(userContracts, function (contract) {
                    return contract.projectIds;
                });
                contractedProjects = _.uniq(_.flatten(contractedProjects));
                allTimeEntries = TimeEntries.find({
                    userId: Meteor.userId(),
                    projectId: {$in: contractedProjects}
                }).fetch();
            }

            if (userContracts && userContracts.length != 0) {
                allTimeEntries = _.filter(allTimeEntries, function (entry) {
                    return _.has(entry, 'contractId') && _.has(entry, 'taskId');
                });

                var todayTimeEntries = tmpl.filterEntries(allTimeEntries, today.startOfDay, today.endOfDay);
                var yesterdayTimeEntries = tmpl.filterEntries(allTimeEntries, yesterday.startOfDay, yesterday.endOfDay);
                var thisWeekEntries = tmpl.filterEntries(allTimeEntries, thisWeek.startOfWeek, thisWeek.endOfWeek);
                var lastWeekEntries = tmpl.filterEntries(allTimeEntries, lastWeek.startOfWeek, lastWeek.endOfWeek);
                var monthEntries = tmpl.filterEntries(allTimeEntries, month.startOfMonth, month.endOfMonth);
                var lastMonthEntries = tmpl.filterEntries(allTimeEntries, lastMonth.startOfMonth, lastMonth.endOfMonth);


                var todayCounts = tmpl.getTimeMoneySpend(todayTimeEntries);
                var yesterdayCounts = tmpl.getTimeMoneySpend(yesterdayTimeEntries);
                var thisWeekCounts = tmpl.getTimeMoneySpend(thisWeekEntries);
                var lastWeekCounts = tmpl.getTimeMoneySpend(lastWeekEntries);
                var monthCounts = tmpl.getTimeMoneySpend(monthEntries);
                var lastMonthCounts = tmpl.getTimeMoneySpend(lastMonthEntries);

                if (title == 'Spendings') {
                    var todayUsersWithCounts = tmpl.getCountsForUsers(todayTimeEntries);
                    var yesterdayUsersWithCounts = tmpl.getCountsForUsers(yesterdayTimeEntries);
                    var thisWeekUsersWithCounts = tmpl.getCountsForUsers(thisWeekEntries);
                    var lastWeekUsersWithCounts = tmpl.getCountsForUsers(lastWeekEntries);
                    var monthUsersWithCounts = tmpl.getCountsForUsers(monthEntries);
                    var lastMonthUserWithCounts = tmpl.getCountsForUsers(lastMonthEntries);

                }
                else if (title == 'Earnings') {
                    var todayTasksWithCounts = tmpl.getCountsForTasks(todayTimeEntries);
                    var yesterdayTasksWithCounts = tmpl.getCountsForTasks(yesterdayTimeEntries);
                    var thisWeekTasksWithCounts = tmpl.getCountsForTasks(thisWeekEntries);
                    var lastWeekTasksWithCounts = tmpl.getCountsForTasks(lastWeekEntries);
                    var monthTasksWithCounts = tmpl.getCountsForTasks(monthEntries);
                    var lastMonthTasksWithCounts = tmpl.getCountsForTasks(lastMonthEntries);
                }
// console.log(todayUsersWithCounts);
                var result = [
                    {
                        name: 'Today',
                        counts: todayCounts,
                        items: title == 'Spendings' ? todayUsersWithCounts : todayTasksWithCounts
                    },
                    {
                        name: 'Yesterday',
                        counts: yesterdayCounts,
                        items: title == 'Spendings' ? yesterdayUsersWithCounts : yesterdayTasksWithCounts
                    },
                    {
                        name: 'This week',
                        counts: thisWeekCounts,
                        items: title == 'Spendings' ? thisWeekUsersWithCounts : thisWeekTasksWithCounts
                    },
                    {
                        name: 'Last week',
                        counts: lastWeekCounts,
                        items: title == 'Spendings' ? lastWeekUsersWithCounts : lastWeekTasksWithCounts
                    },
                    {
                        name: 'This month',
                        counts: monthCounts,
                        items: title == 'Spendings' ? monthUsersWithCounts : monthTasksWithCounts
                    },
                    {
                        name: 'Last month',
                        counts: lastMonthCounts,
                        items: title == 'Spendings' ? lastMonthUserWithCounts : lastMonthTasksWithCounts
                    }
                ];
                return result;
            }
            else {
                var noContractResult = {timeTracked: 0, totalSpent: '0.00'};
                return [
                    {name: 'Today', counts: noContractResult, items: []},
                    {name: 'Yesterday', counts: noContractResult, items: []},
                    {name: 'This week', counts: noContractResult, items: []},
                    {name: 'Last week', counts: noContractResult, items: []},
                    {name: 'This month', counts: noContractResult, items: []},
                    {name: 'Last month', counts: noContractResult, items: []}
                ];
            }
        }
        else {
            return [];
        }
    },
    emptyCardMessage: function () {
        return 'No data to show';
    },
    dataLoadingMessage: function () {
        return 'Loading...';
    },
    ready: function () {
        return Template.instance().ready.get();
    }
});

Template.spendingsEarningsList.events({});