import {Meteor} from 'meteor/meteor';
import { Projects } from '/imports/api/projects/projects';
import { Tasks } from '/imports/api/tasks/tasks';
import { Tools } from '/imports/api/tools/tools';
import { Workplaces } from '/imports/api/workPlaces/workPlaces';
import { Companies } from '/imports/api/companies/companies';
import { Teams } from '/imports/api/teams/teams';
import { VZ } from '/imports/startup/both/namespace';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';

Meteor.publish("allSearch", function (query) {
    check(query, String);
    var userId = this.userId;
    var limit = 5;

    if (userId) {
        return [
            users(query, 6),
            companies(query, limit, userId),
            projects(query, limit, userId),
            timetracker(query, limit, userId),
            tasks(query, limit, userId),
            // tools(query, limit),
            // workplaces(query, limit, userId),
            teams(query, limit, userId)
        ]
    }

    this.ready();
});

Meteor.publish("searchTab", function (query, template) {
    check(query, String);
    check(template, String);
    var userId = this.userId;

    if (userId) {
        var subscriptions = {
            companiesSearch: companies,
            usersSearch: users,
            projectsSearch: projects,
            timetrackerSearch: timetracker,
            tasks: tasks,
            // toolsSearch: tools,
            // workplacesSearch: workplaces,
            teamsSearch: teams
        };

        return subscriptions[template](query, null, userId);
    }
    this.ready();
});


////////////////PUBLISH FUNCTIONS///////////////////////

var defineParams = function (query, limit) {
    var params = {
        regExp: new RegExp(query, "gi"),
        limitQuery: {}
    };
    if (limit) {
        params.limitQuery = {
            limit: limit
        };
    }

    return params
};

var users = function (query, limit) {
    var params = defineParams(query, limit);

    return Meteor.users.find({
        $or: [{
            "profile.fullName": {
                $regex: params.regExp
            }
        }, {
            "emails.address": {
                $regex: params.regExp
            }
        }]
    }, params.limitQuery);
};

var usersIdByQuery = function (query) {
    var usersList = users(query).fetch();
    return _.map(usersList, function (user) {
        return user._id;
    });
};

var companies = function (query, limit, userId) {
    var params = defineParams(query, limit);

    return Companies.find({
        $and: [{
            $or: [{
                ownerId: userId
            }, {
                assignedUsersIds: userId
            }, {
                isPrivate: false
            }]
        }, {
            name: {
                $regex: params.regExp
            }
        }],
        status: {$ne: "archived"}
    }, params.limitQuery);
};

var projects = function (query, limit, userId) {
    var params = defineParams(query, limit);
    var users = usersIdByQuery(query);
    return Projects.find({
        $and: [{
            $or: [{
                ownerId: userId
            }, {
                assignedUsersIds: userId
            }]
        }, {
            $or: [{
                assignedUsersIds: {
                    $in: users
                }
            }, {
                ownerId: {
                    $in: users
                }
            }, {
                name: {
                    $regex: params.regExp
                }
            }, {
                tags: {
                    $regex: params.regExp
                }
            }, {
                projectKey: {
                    $regex: params.regExp
                }
            }]
        }],
        archived: false
    }, params.limitQuery);
};

var tasks = function (query, limit, userId) {
    var params = defineParams(query, limit);
    var users = usersIdByQuery(query);
    return Tasks.find({
        $and: [{
            $or: [{
                ownerId: userId
            }, {
                membersIds: userId
            }]
        }, {
            $or: [{
                membersIds: {
                    $in: users
                }
            }, {
                ownerId: {
                    $in: users
                }
            }, {
                name: {
                    $regex: params.regExp
                }
            }, {
                taskKey: {
                    $regex: params.regExp
                }
            }, {
                tags: {
                    $regex: params.regExp
                }
            }]
        }]
    }, params.limitQuery);
};

var timetracker = function (query, limit, userId) {
    var params = defineParams(query, limit);

    return TimeEntries.find({
            _done: true,
            message: {
                $regex: params.regExp
            },
            userId: userId
        }, params.limitQuery);
};

var tools = function (query, limit) {
    var params = defineParams(query, limit);

    return Tools.find({
        name: {
            $regex: params.regExp
        }
    }, params.limitQuery)
};

var teams = function (query, limit, userId) {
    var params = defineParams(query, limit);
    var users = usersIdByQuery(query);

    return Teams.find({
        $and: [{
            $or: [{
                ownerId: userId
            }, {
                assignedUsersIds: userId
            }, {
                isPrivate: false
            }]
        }, {
            $or: [{
                name: {
                    $regex: params.regExp
                }
            }, {
                description: {
                    $regex: params.regExp
                }
            }, {
                assignedUsersIds: {
                    $in: users
                }
            }, {
                ownerId: {
                    $in: users
                }
            }]

        }]
    }, params.limitQuery)
};

var workplaces = function (query, limit, userId) {
    var params = defineParams(query, limit);
    var users = usersIdByQuery(query);
    var toolsList = tools(query).fetch();
    toolsList = _.map(toolsList, function (tool) {
        return tool._id;
    });

    return Workplaces.find({
        $and: [{
            $or: [{
                ownerId: userId
            }, {
                assignedUsersIds: userId
            }]
        }, {
            $or: [{
                name: {
                    $regex: params.regExp
                }
            }, {
                ownerId: {
                    $in: users
                }
            }, {
                "tools._id": {
                    $in: tools
                }
            }]
        }]
    }, params.limitQuery)
};

/////users/pub
Meteor.publish('user', function (idOrEmail) {
    return Meteor.users.find({
        $or: [
            {'_id': idOrEmail},
            {'emails.address': idOrEmail}
        ],
        'profile.isArchived': false,
        'profile.isBlocked': false
    }, {fields: {services: 0}});
});

Meteor.publish('users', function (params, options) {
    if (this.userId) {
        params = params || {};
        options = options || {};
        params['profile.isArchived'] = false;
        params['profile.isBlocked'] = false;
        return Meteor.users.find(params, options);
    }
});


Meteor.publish('usersByNameOrEmailRegExp', function (searchString, limit) {
    var searchParams = {
        _id: {$ne: this.userId}
    };
    if (searchString != '') {
        var searchStringRegExp = new RegExp(searchString, 'ig');
        searchParams.$or = [
            {'profile.fullName': {$regex: searchStringRegExp}},
            {'emails.address': {$regex: searchStringRegExp}}
        ];
    }

    return Meteor.users.find(searchParams, {limit: limit});
});

Meteor.publish('assignedUsers', function (ids) {
    return Meteor.users.find({_id: {$in: ids, $ne: this.userId}});
});

Meteor.publish('userPresence', function (id) {
    // Example of using a filter to publish only 'online' users:
    return UserPresences.find({userId: id}, {fields: {'createdAt': 1}});
});

Meteor.publish('userStatus', function () {
    return Meteor.users.find({'profile.online': true}, {fields: {services: 0}});
});

Meteor.publish('userDetailNext', function (userId) {
    var user = Meteor.users.findOne({_id: userId});
    return Meteor.users.find({createdAt: {$gt: user.createdAt}, 'profile.isArchived': false, 'profile.isBlocked': false}, {
        sort: {createdAt: 1},
        limit: 1,
        fields: {'services': 0}
    });
});

Meteor.publish('userDetailPrev', function (userId) {
    var user = Meteor.users.findOne({_id: userId});
    return Meteor.users.find({createdAt: {$lt: user.createdAt}, 'profile.isArchived': false, 'profile.isBlocked': false}, {
        sort: {createdAt: -1},
        limit: 1,
        fields: {'services': 0}
    });
});