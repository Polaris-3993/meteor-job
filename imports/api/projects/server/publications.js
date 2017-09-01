import { Projects } from '../projects';
import { Tasks } from '/imports/api/tasks/tasks';
import { Contracts } from '/imports/api/contracts/contracts';
import { ActivityMessages } from '/imports/api/activityMessages/activityMessages';
import { Teams } from '/imports/api/teams/teams';

Meteor.publishComposite('Projects', function (id, companyId, newQuery) {
    var userId = this.userId;
    newQuery = newQuery || {};
    var query = {
        $or: [
            {ownerId: userId},
            {assignedUsersIds: userId}
        ]
    };
    if(id == false){
        query.archived = false;
    }
    query = _.extend(query, newQuery);
    if(companyId){
        query.companyId = companyId;
    }
    return {
        find: function () {
            if (id) {
                return Projects.find({
                    _id: id,
                    $or: [
                        {ownerId: userId},
                        {assignedUsersIds: userId}
                    ]
                });
            }
            let projects = Projects.find(query);
            return projects;
        },
        children: [
            {
                find: function (project) {
                    return Tasks.find({projectId: project._id});
                },
                children: [
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
            },
            {
                find: function (project) {
                    var ownerId = project.ownerId || '';
                    return Meteor.users.find({_id: ownerId}, {
                        fields: {profile: 1, roles: 1, emails: 1}
                    });
                }
            },
            {
                find: function (project) {
                    return Teams.find({assignedProjectId: project._id});
                }
            }
        ]
    }
});
Meteor.publishComposite('projectInfo', function (id) {
    var userId = this.userId;
    return {
        find: function () {
            if (id) {
                return Projects.find({
                    _id: id,
                    $or: [
                        {ownerId: userId},
                        {assignedUsersIds: userId}
                    ]
                });
            }
        },
        children: [
            {
                find: function (project) {
                    var contracts = Contracts.find({employerId: project.ownerId});
                    return contracts;
                },
                children: [
                    {
                        find: function(contract, project) {
                            var workerId = contract.workerId;
                            var users = Meteor.users.find({$or: [{_id:  workerId}, {_id: {$in: project.assignedUsersIds}}]}, {
                                fields: {profile: 1, roles: 1, emails: 1}
                            });
                            return users;
                        }
                    },
                    {
                        find: function(contract, project) {
                            var users = Meteor.users.find({_id:  project.ownerId}, {
                                fields: {profile: 1, roles: 1, emails: 1}
                            });
                            return users;
                        }
                    }
                ]
            }
        ]
    }
});

Meteor.publishComposite('ProjectActivityMessages', function (id) {
    return {
        find: function () {
            if (id) {
                return Projects.find({
                    _id: id
                });
            }
        },
        children: [
            {
                find: function (project) {
                    var activityMessagesIds = project.activityMessagesIds || [];
                    return ActivityMessages.find({_id: {$in: activityMessagesIds}});
                },
                children: [
                    {
                        find: function(message, project) {
                            var replyedMessagesIds = message.replyedMessagesIds || [];
                            return ActivityMessages.find({_id: {$in: replyedMessagesIds}});
                        }
                    },
                    {
                        find: function(message, project) {
                            var changedUsersIds = message.changedUsersIds || [];
                            return Meteor.users.find({_id: {$in: changedUsersIds}}, {
                                fields: {profile: 1}
                            });
                        }
                    },
                    {
                        find: function(message, project) {
                            var projectOwner = message.projectOwner || '';
                            return Meteor.users.find({_id: projectOwner}, {
                                fields: {profile: 1}
                            });
                        }
                    }
                ]
            }
        ]
    }
});
Meteor.publish('projectsByNameRegExp', function (searchString, limit) {
    var userId = this.userId;

    var searchParams = {};
    if (searchString != '') {
        var searchStringRegExp = new RegExp(searchString, 'ig');
        searchParams.name = {$regex: searchStringRegExp};
    }
    // searchParams.$or = [
    //     {ownerId: userId},
    //     {assignedUsersIds: userId}
    // ];
    searchParams.ownerId = userId;
    searchParams.archived = false;

    return Projects.find(searchParams, {limit: limit});
});

Meteor.publish('filterProjects', function (searchString) {
    var userId = this.userId;
    if (userId) {
        if (searchString && searchString.trim().length > 0) {
            return Projects.find({
                $or: [{
                    ownerId: userId
                }, {
                    assignedUsersIds: userId
                }],
                name: {
                    $regex: searchString
                }
            })
        } else {
            return Projects.find({
                $or: [{
                    ownerId: userId
                }, {
                    assignedUsersIds: userId
                }]
            })
        }
    }
    this.ready();
});


Meteor.publish("clientGoogleProjects", function(userId) {
    console.log("publish clientGoogleProjects", userId);
    if(userId) {
        return Projects.find({
            $or: [
                {ownerId: userId},
                {assignedUsersIds: userId}
            ]
        });
    } else {
        return this.ready();
    }
});
