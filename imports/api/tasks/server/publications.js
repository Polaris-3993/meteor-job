import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Projects } from '/imports/api/projects/projects';
import { Tasks } from '../tasks';

Meteor.publishComposite('Tasks', function (params, options) {
    return {
        find: function () {
            params = params || {};

            var userId = this.userId;

            var relatedProjectsIds = Roles.getGroupsForUser(userId, 'project-worker');
            var relatedTeamsIds = Roles.getGroupsForUser(userId, 'team-member');

            var assignedTasks = Roles.getGroupsForUser(userId, 'task-member');
            var tasksCreatedByUser = Roles.getGroupsForUser(userId, 'task-owner');
            var relatedTasksDirectly = _.union(assignedTasks, tasksCreatedByUser);

            params.$or = [
                {_id: {$in: relatedTasksDirectly}},
                {projectId: {$in: relatedProjectsIds}},
                {teamsIds: {$in: relatedTeamsIds}}
            ];
            return Tasks.find(params);
        },
        children: [
            {
                find: function (task) {
                    return Projects.find(task.projectId);
                }
            },
            {
                find: function (task) {
                    var relatedUsersIds = task.membersIds || [];
                    relatedUsersIds.push(task.ownerId);

                    return Meteor.users.find({_id: {$in: relatedUsersIds}}, {
                        fields: {profile: 1, roles: 1, emails: 1}
                    });
                }
            }
        ]
    }
});

//this publication is used only for dashboard assigned to me card
Meteor.publishComposite('timeEntriesForUserTasks', function (query) {
    var userId = this.userId;
    if(userId){
        return {
            find: function () {
                return Tasks.find(query);
            },
            children: [
                {
                    find: function (task) {
                        return TimeEntries.find({taskId: task._id, _done: true, _isActive: false}, {
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
            ]
        }
    }
});

Meteor.publishComposite('tasksByType', function (query, params) {
    var userId = this.userId;
    return {
        find: function () {
            return Tasks.find(query, params);
        },
        children: []
    }
});

Meteor.publish('tasksCounts', function (projectId) {
    var userId = this.userId;
    if(userId){
        Counts.publish(this, 'all', Tasks.find({status: {$in: ['Opened', 'In-review']}, projectId: projectId, archived: false}));
        Counts.publish(this, 'assigned', Tasks.find({projectId: projectId, membersIds: userId, status: {$nin: ['In-review', 'Closed']}}));
        Counts.publish(this, 'in-review', Tasks.find({
            projectId: projectId,
            $or: [{membersIds: userId}, {ownerId: userId}],
            status: 'In-review'
        }));
        Counts.publish(this, 'completed', Tasks.find({
            status: 'Closed',
            archived: true,
            projectId: projectId
        }));
    }
});
Meteor.publish('filterTasks', function (searchString, projectId) {
    var userId = this.userId;
    if (userId) {
        var query = {
            $and: [{
                $or: [{
                    ownerId: userId
                }, {
                    membersIds: userId
                }]
            }],
            archived: false
        };
        if (projectId) {
            query.projectId = projectId;
        }
        if (searchString && searchString.trim().length > 0) {
            query.taskKey = {
                $regex: searchString, $options: 'gi'
            };
            return Tasks.find(query);
        } else {
            return Tasks.find(query);
        }
    }
    this.ready();
});

Meteor.publish('googleClientTasks', function (userId, projectId) {
    console.log('publish tasks', userId, projectId);
    if (userId) {
        return Tasks.find({
            $and: [
                {
                    projectId: projectId
                },
                {
                    $or: [
                        {ownerId: userId},
                        {membersIds: userId}
                    ]
                }
            ]
        });
    } else {
        this.ready();
    }
});
