import { TimeEntries } from '../timeEntries';
import { Projects } from '/imports/api/projects/projects';
import { Tasks } from '/imports/api/tasks/tasks';
import { Contracts } from '/imports/api/contracts/contracts';
import { Screenshots } from '/imports/api/screenShots/screenShots';
import { VZ } from '/imports/startup/both/namespace';

Meteor.publishComposite('timeEntries', function (queryParams, options) {
    return {
        find: function () {
            // this._params for correct work with subscription from desktop app(publish composite doesn't see passed params)
            var queryParams = queryParams || this._params[0] || {};
            var options = options || this._params[1] || {};

            var query = _.pick(queryParams, 'projectId', 'startDate', 'endDate');
            var canViewTimeEntries =
                VZ.canUser('viewTimeEntriesRelatedToProject', this.userId, queryParams.projectId);
            if (queryParams.userId && canViewTimeEntries) {
                query.userId = queryParams.userId;
            } else {
                query.userId = this.userId;
            }

            _.extend(query, {
                _done: true,
                _isActive: false
            });

            return TimeEntries.find(query, options);
        },
        children: [
            {
                find: function (timeEntry) {
                    return this.ready();
                }
            }
        ]
    }
});

Meteor.publish('timeEntriesAdminOrUser', function (projectId) {
    if (!this.userId) {
        throw new Meteor.Error('Only authorized users can see time entries');
    }
    const isBoss = VZ.canUser('viewTimeEntriesRelatedToProject', this.userId, projectId);
    if (isBoss === true) {
        return TimeEntries.find({
            projectId,
            _done: true,
            _isActive: false
        });
    } else {
        return TimeEntries.find({
            projectId,
            userId: this.userId,
            _done: true,
            _isActive: false
        });
    }
});
Meteor.publishComposite('timeEntriesForUserProjects', function (isDashboardProjectCard) {
    var userId = this.userId;
    var query = {ownerId: userId};
    if (isDashboardProjectCard) {
        query = {
            $or: [
                {ownerId: userId},
                {assignedUsersIds: userId}
            ],
            archived: false
        };
    }
    if (userId) {
        var children = [
            {
                find: function (project) {
                    var timeEntriesQuery = {projectId: project._id, _done: true, _isActive: false};
                    if (isDashboardProjectCard) {
                        timeEntriesQuery.userId = userId;
                    }
                    return TimeEntries.find(timeEntriesQuery, {
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
                }
            }
        ];
        return {
            find: function () {
                return Projects.find(query);
            },
            children: children
        }
    }
});

Meteor.publishComposite('dashboardInReviewCard', function (companyId) {
    var userId = this.userId;
    var contractQuery = {
        employerId: userId
    };
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
    if (userId) {
        var children = [
            {
                find: function (project, contract) {
                    var timeEntriesQuery = {projectId: project._id, _done: true, _isActive: false};
                    return TimeEntries.find(timeEntriesQuery, fields);
                }
            },
            {
                find: function (project, contract) {
                    var query = {projectId: project._id,  status: 'In-review'};
                    return Tasks.find(query);
                }
            }
        ];
        if(companyId){
            contractQuery.companyId = companyId;
        }
        return {
            find: function () {
                return Contracts.find(contractQuery);
            },
            children: [
                {
                    find: function (contract) {
                        return Projects.find({_id: {$in: contract.projectIds}, ownerId: userId});
                    },
                    children: children
                }
            ]
        }
    }
});

Meteor.publishComposite('projectTimeEntries', function (projectId) {
    return {
        find: function () {
            var query = {
                projectId: projectId
            };

            _.extend(query, {
                _done: true,
                _isActive: false
            });

            return TimeEntries.find(query);
        },
        children: [
            {
                find: function (timeEntry) {
                    return this.ready();
                }
            }
        ]
    }
});

//TODO: canUser...
Meteor.publishComposite('timeEntriesAndScreenshots', function (query, options) {
    var userId = this.userId;
    if (!_.isObject(query)) {
        query = {};
    }
    options = options || {sort: {startDate: 1}};
    return {
        find: function () {
            _.extend(query, {
                userId: userId
            });
            return TimeEntries.find(query, options);
        },
        children: [
            {
                find: function (timeEntry) {
                    return Screenshots.find({timeEntryId: timeEntry._id}, {sort: {takenAt: 1}});
                }
            },
            {
                find: function (timeEntry) {
                    return Contracts.find({
                        projectIds: timeEntry.projectId, $or: [{
                            employerId: userId
                        }, {
                            workerId: userId
                        }]
                    });
                }
            }
        ]
    }
});

Meteor.publishComposite('timeEntriesAndScreenshotsWorker', function (query, companyId) {
    if (!_.isObject(query)) {
        query = {};
    }
    var userId = this.userId;
    var contractQuery = {employerId: userId};
    if(companyId){
        contractQuery.companyId = companyId;
    }
    var children = [
        {
            find: function (contract) {
                query.contractId = contract._id;
                return TimeEntries.find(query, {sort: {startDate: 1}});
            },
            children: [
                {
                    find: function (timeEntry, contract) {
                        return Screenshots.find({timeEntryId: timeEntry._id}, {sort: {takenAt: 1}});
                    }
                }
            ]
        }
    ];
    return {
        find: function () {
            return Contracts.find(contractQuery);
        },
        children: children
    }
});

Meteor.publish('projects', function () {
    var userId = this.userId;
    if (userId) {
        return Projects.find({
            $or: [{assignedUsersIds: userId}, {ownerId: userId}],
            archived: false
        });
    } else {
        return this.ready();
    }
});

Meteor.publish('activeTimeEntry', function (projectId, isDesktopApp) {
    var userId = this.userId;
    if (userId) {
        var query = {
            _isActive: true,
            userId: userId
        };
        if (projectId) {
            query.projectId = projectId;
        }

        //// stop timeEntry, when connection with user is lost
        //if (isDesktopApp) {
        //    this._session.socket.on('close', Meteor.bindEnvironment(function () {
        //        var activeTimeEntry = TimeEntries.findOne({userId: userId, _isActive: true});
        //        if (activeTimeEntry) {
        //            VZ.TimeTracker.methods.stopTracking(activeTimeEntry._id, userId);
        //        }
        //    }, function (err) {
        //        console.log(err)
        //    }));
        //}

        return TimeEntries.find(query);
    } else {
        return this.ready();
    }
});

Meteor.publish('timeEntriesClientGoogle', function (data) {
    console.log('publish timeEntriesClientGoogle', data.userId);
    if (data.userId && VZ.canUser('viewTimeEntriesRelatedToProject', data.userId, data.projectId)) {
        const query = {
            userId: data.userId,
            projectId: data.projectId,
            taskId: data.taskId,
            startDate: data.startDate,
            _done: true,
            _isActive: false
        };
        return TimeEntries.find(query);
    } else {
        return this.ready();
    }
});

Meteor.publish('desktopAllUserTimeEntries', function (desktopUserId) {
    console.log('publish desktopAllUserTimeEntries', desktopUserId);
    const userId = desktopUserId || this.userId;
    if (userId) {
        const query = {
            userId: userId,
            _done: true,
            _isActive: false
        };
        return TimeEntries.find(query);
    } else {
        return this.ready();
    }
});

Meteor.publish('activeTimeEntryClientGoogle', function (userId, projectId, taskId) {
    console.log('publish activeTimeEntryClientGoogle', userId);
    if (userId) {
        if (projectId && taskId) {
            const query = {
                _isActive: true,
                userId,
                projectId,
                taskId
            };
            return TimeEntries.find(query);
        } else {
            throw new Meteor.Error('Project id or task id is undefined');
        }
    } else {
        return this.ready();
    }
});


Meteor.publish('activeTimeEntryTab', function (entryId) {
    if (entryId) {
        return TimeEntries.find({_id: entryId});
    }
    else {
        return this.ready();
    }
});

Meteor.publish('rangeWorkTime', function(dateRange, tagFilter, projectFilter, messageFilter) {
    var userId = this.userId;
    if (userId) {
        var start = moment(dateRange.date).startOf(VZ.dateRanges[dateRange.range]).toDate();
        var end = moment(dateRange.date).endOf(VZ.dateRanges[dateRange.range]).toDate();
        var tagQuery = [{
            tags: {
                $in: tagFilter
            }
        }];
        var projectQuery = [{
            projectId: {
                $in: projectFilter
            }
        }];

        if (_.contains(tagFilter, 'NoTags')) {
            tagQuery = [{
                tags: {
                    $in: tagFilter
                }
            }, {
                tags: []
            }]
        }

        if (_.contains(projectFilter, 'NoProject')) {
            projectQuery = [{
                projectId: {
                    $in: projectFilter
                }
            }, {
                projectId: {
                    $exists: false
                }
            }]
        }

        var query = {
            userId: userId,
            startDate: {
                $gte: start,
                $lte: end
            }
        };

        if (tagFilter.length > 0 && projectFilter.length > 0) {
            query.$and = [{
                $or: projectQuery
            }, {
                $or: tagQuery
            }]
        }
        else {
            if (tagFilter.length > 0) {
                query.$or = tagQuery
            }

            if (projectFilter.length > 0) {
                query.$or = projectQuery
            }
        }

        if (messageFilter && messageFilter.trim().length > 0) {
            query.message = {$regex: messageFilter}
        }
        return TimeEntries.find(query)
    }
    this.ready();
});

Meteor.publish('userRangeWorkTime', function(dateRange, ids, messageFilter) {
    if (ids && ids.length > 0) {
        var start = moment(dateRange.date).startOf(VZ.dateRanges[dateRange.range]).toDate();
        var end = moment(dateRange.date).endOf(VZ.dateRanges[dateRange.range]).toDate();

        var query = {
            userId: { $in: ids },
            startDate: {
                $gte: start,
                $lte: end
            }
        };
        if (messageFilter && messageFilter.trim().length > 0) {
            query.message = {$regex: messageFilter, $options: 'gi'}
        }
        return TimeEntries.find(query);
    }
    this.ready();
});

Meteor.publishComposite('userRangeWorkTimeCard', function (dateRange, ids, companyId, messageFilter) {
    var userId = this.userId;
    var contractQuery = {
        employerId: userId
    };
    var query = {};
    if (userId) {
        if (ids && ids.length > 0) {
            var start = moment(dateRange.date).startOf(VZ.dateRanges[dateRange.range]).toDate();
            var end = moment(dateRange.date).endOf(VZ.dateRanges[dateRange.range]).toDate();
            query.userId = { $in: ids };
            query.startDate = {
                $gte: start,
                $lte: end
            }
        }
        if(companyId){
            contractQuery.companyId = companyId;
        }
        return {
            find: function () {
                var contracts = Contracts.find(contractQuery);
                return contracts;
            },
            children: [
                {
                    find: function (contract) {
                        query.contractId = contract._id;
                        if (messageFilter && messageFilter.trim().length > 0) {
                            query.message = {$regex: messageFilter, $options: 'gi'}
                        }
                        return TimeEntries.find(query);
                    }
                }
            ]
        }
    }
});
