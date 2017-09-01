import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Projects } from '/imports/api/projects/projects';
import { Tasks } from '/imports/api/tasks/tasks';
import { Contracts } from '../contracts';
import { Companies } from '/imports/api/companies/companies';
import { ContractsStatusChanges } from '/imports/api/contractsStatusChanges/contractsStatusChanges';
import { Meteor } from 'meteor/meteor';

Meteor.publishComposite('Contracts', function (params, options, shouldPublishAllRelatedDocs) {
    var children = [{
        find: function (contract) {
            return Companies.find(contract.companyId);
        }
    }];

    if (shouldPublishAllRelatedDocs) {
        children.push({
            find: function (contract) {
                return ContractsStatusChanges.find({contractId: contract._id});
            }
        });
        children.push({
            find: function (contract) {
                return Meteor.users.find(contract.workerId);
            }
        });
        children.push({
            find: function (contract) {
                return Meteor.users.find(contract.employerId);
            }
        });
        children.push({
            find: function (contract) {
                return Projects.find(contract.projectId);
            }
        });
    }

    return {
        find: function () {
            var userId = this.userId;
            params = params || {};
            options = options || {};

            var companiesIdsWhereUserAdminOrManager =
                Roles.getGroupsForUser(userId, ['company-admin', 'company-manager']);

            _.extend(params, {
                $or: [{
                    companyId: {$in: companiesIdsWhereUserAdminOrManager}
                }, {
                    employerId: userId
                }, {
                    workerId: userId
                }]
            });
            return Contracts.find(params, options);
        },
        children: children
    }
});

Meteor.publishComposite('ownerContracts', function (isDashboardCard, companyId) {
    var userId = this.userId;
    var query = {employerId: userId};
    if(companyId){
        query.companyId = companyId;
    }
    var children = [
        {
            find: function (contract) {
                return Meteor.users.find({_id: contract.workerId}, {
                    fields: {profile: 1, roles: 1, emails: 1}
                });
            }
        },
        {
            find: function (contract) {
                return Companies.find({_id: contract.companyId});
            }
        }
    ];
    if(isDashboardCard){
        children = [      {
            find: function (contract) {
                return Meteor.users.find({_id: contract.workerId}, {
                    fields: {profile: 1, roles: 1, emails: 1}
                });
            }
        }];
    }
    return {
        find: function () {
            return Contracts.find(query);
        },
        children: children
    }
});

Meteor.publishComposite('entriesByTaskIds', function (taskIds) {
    var userId = this.userId;
    if(userId){
        return {
            find: function () {
                return TimeEntries.find({taskId: {$in: taskIds}}, {
                    fields: {
                        _id: 1,
                        projectId: 1,
                        taskId: 1,
                        contractId: 1,
                        paymentType: 1,
                        paymentRate: 1,
                        message: 1,
                        startDate: 1,
                        endDate: 1,
                        _isActive: 1,
                        userId: 1
                    }
                });
            },
            children: [
                {
                    find: function (entry) {
                        return Tasks.find({_id: entry.taskId});
                    }
                }
            ]
        }
    }
});

Meteor.publishComposite('ownerContractsActiveTimeEntries', function (showTimeEntries, companyId) {
    var userId = this.userId;
    var query = {employerId: userId};
    var children = [];
    var fields =  {
        fields: {
            _id: 1,
            projectId: 1,
            taskId: 1,
            contractId: 1,
            paymentType: 1,
            paymentRate: 1,
            message: 1,
            startDate: 1,
            endDate: 1,
            _isActive: 1,
            userId: 1
        }
    };
    if (showTimeEntries) {
        children.push({
            find: function (user, contract) {
                return TimeEntries.find({userId: user._id}, fields);
            },
            find: function (user, contract) {
                var lastWorkedEntryId = user.profile.lastWorkedEntryId;
                return TimeEntries.find({_id: lastWorkedEntryId}, fields);
            },
            find: function () {
                return TimeEntries.find({userId: userId, _isActive: true});
            }
        });
        if(companyId){
            query.companyId = companyId;
        }
    }
    return {
        find: function () {
            return Contracts.find(query);
        },
        children: [
            {
                find: function (contract) {
                    return Meteor.users.find({_id: contract.workerId}, {
                        fields: {profile: 1, roles: 1, emails: 1}
                    });
                },
                children: children
            }
        ]
    }
});

Meteor.publishComposite('entriesByUserContracts', function () {
    var userId = this.userId;
    return {
        find: function () {
            return Contracts.find({workerId: userId});
        },
        children: [
            {
                find: function (contract) {
                    return TimeEntries.find({userId: contract.workerId, projectId: {$in: contract.projectIds}, _isActive: false}, {
                        fields: {
                            _id: 1,
                            projectId: 1,
                            taskId: 1,
                            contractId: 1,
                            paymentType: 1,
                            paymentRate: 1,
                            message: 1,
                            startDate: 1,
                            endDate: 1,
                            _isActive: 1,
                            userId: 1
                        }
                    });
                },
                children: [
                    {
                        find: function (entry, contract) {
                            return Tasks.find({taskId: entry.taskId, membersIds: contract.workerId});
                        }
                    }
                ]

            }
        ]
    }
});

Meteor.publishComposite('entriesByProjectIdsAndUsers', function (companyId) {
    var userId = this.userId;
    return {
        find: function () {
            var query = {employerId: userId};
            if(companyId){
                query.companyId = companyId;
            }
            var contracts = Contracts.find(query);

            return contracts;
        },
        children: [
            {
                find: function (contract) {
                    return Meteor.users.find({_id: contract.workerId}, {
                        fields: {profile: 1, roles: 1, emails: 1}
                    });
                },
                children: [
                    {
                        find: function (user, contract) {
                            return TimeEntries.find({userId: user._id, projectId: {$in: contract.projectIds}, _isActive: false}, {
                                fields: {
                                    _id: 1,
                                    projectId: 1,
                                    taskId: 1,
                                    contractId: 1,
                                    paymentType: 1,
                                    paymentRate: 1,
                                    message: 1,
                                    startDate: 1,
                                    endDate: 1,
                                    _isActive: 1,
                                    userId: 1
                                }
                            });
                        },
                        children: [
                            {
                                find: function (entry, user, contract) {
                                    return Tasks.find({taskId: entry.taskId});
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
});

Meteor.publish("clientAppContracts", function (appUserId) {
    console.log("publish contracts for", appUserId);
    const userId = appUserId || this.userId;
    if (userId) {
        return Contracts.find({
            workerId: userId,
            status: "active"
        });
    } else {
        return this.ready();
    }
});
