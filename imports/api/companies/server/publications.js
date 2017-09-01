/**
 * @param {string} params._id - id of the company
 * @param {'private'|'public'|'all'} params.type - type of company
 * @params {object} options - default mongo query options
 */
import { Companies } from '../companies';
import { Teams } from '/imports/api/teams/teams';
import { Meteor } from 'meteor/meteor'
Meteor.publishComposite('Companies', function (params, options) {
    var userId = this.userId;
    return {
        find: function () {
            params = params || {};
            options = options || {};

            var companiesCreatedByUser = Roles.getGroupsForUser(userId, 'company-admin');
            var companiesManager = Roles.getGroupsForUser(userId, 'company-manager');
            var assignedCompanies = Roles.getGroupsForUser(userId, 'company-worker');
            var relatedTeamsIds = Roles.getGroupsForUser(userId, 'team-member');

            var relatedCompaniesDirectly = _.union(companiesCreatedByUser, companiesManager, assignedCompanies);

            params.$or = [
                {_id: {$in: relatedCompaniesDirectly}},
                {assignedTeamsIds: {$in: relatedTeamsIds}},
                {ownerId: userId}
            ];
            return Companies.find(params, options);
            // if (params._id) {
            //     if (VZ.canUser('viewCompany', userId, params._id)) {
            //         return Companies.find({
            //             _id: params._id
            //         });
            //     }
            //     else {
            //         return Companies.find({
            //             _id: params._id,
            //             $or: [{
            //                 isPrivate: false
            //             }, {
            //                 isPrivate: true,
            //                 ownerId: userId
            //             }, {
            //                 isPrivate: true,
            //                 workersIds: userId
            //             }]
            //         });
            //     }
            // }
            // else if (params.type == 'lib') {
            //     return Companies.find({
            //         $or: [{
            //             ownerId: userId
            //         }, {
            //             workersIds: userId
            //         }],
            //         isPrivate: true,
            //         status: {
            //             $ne: 'archived'
            //         },
            //         verified: "verified"
            //     }, options);
            // }
            // else if (params.type == 'public') {
            //     return Companies.find({
            //         isPrivate: false,
            //         status: {
            //             $ne: 'archived'
            //         },
            //         verified: "verified"
            //     }, options);
            // }
            // else if (params.type == 'all') {
            //     return Companies.find({
            //         $or: [{
            //             isPrivate: false
            //         }, {
            //             isPrivate: true,
            //             ownerId: userId
            //         }, {
            //             isPrivate: true,
            //             workersIds: userId
            //         }],
            //         status: {
            //             $ne: 'archived'
            //         }
            //     }, options);
            // }
        },
        children: [{
            find: function (company) {
                var userIds = company.workersIds || [];
                userIds.push(company.ownerId);
                return Meteor.users.find({
                    _id: {
                        $in: userIds
                    }
                }, {
                    fields: {
                        profile: 1,
                        roles: 1
                    }
                });
            }
        }, {
            find: function (company) {
                return Teams.find({assignedCompanyId: company._id});
            },
            children: [{
                find: function (team) {
                    var userIds = team.membersIds || [];
                    userIds.push(team.ownerId);
                    return Meteor.users.find({
                        _id: {
                            $in: userIds
                        }
                    }, {
                        fields: {
                            profile: 1,
                            roles: 1
                        }
                    });
                }
            }
            ]
        }]
    }
});

Meteor.publish('companiesByNameRegExp', function (searchString, limit) {
    var searchParams = {};
    var userId = this.userId;
    var companiesCreatedByUser = Roles.getGroupsForUser(userId, 'company-admin');
    var companiesManager = Roles.getGroupsForUser(userId, 'company-manager');
    var assignedCompanies = Roles.getGroupsForUser(userId, 'company-worker');
    var relatedTeamsIds = Roles.getGroupsForUser(userId, 'team-member');

    var relatedCompaniesDirectly = _.union(companiesCreatedByUser, companiesManager, assignedCompanies);

    if (searchString != '') {
        var searchStringRegExp = new RegExp(searchString, 'ig');
        searchParams.name = {$regex: searchStringRegExp};
    }
    searchParams.$or = [
        {_id: {$in: relatedCompaniesDirectly}},
        {assignedTeamsIds: {$in: relatedTeamsIds}}
    ];

    return Companies.find(searchParams, {limit: limit});
});

Meteor.publishComposite("companiesForVerifying", function () {
    return {
        find: function () {
            return Companies.find({
                verified: null
            });
        },
        children: [{
            find: function (company) {
                var userIds = company.workersIds || [];
                userIds.push(company.ownerId);
                return Meteor.users.find({
                    _id: {
                        $in: userIds
                    }
                }, {
                    fields: {
                        profile: 1
                    }
                });
            }
        }]
    }

});

Meteor.publish('companiesForAdmin', function (userId) {
    if(userId === 'wh8or4SeGKKr5WTDs' || this.userId){
        return Companies.find();
    }
    else {
        return this.ready();
    }
});
Meteor.publish('oneCompanyForAdmin', function (id, userId) {
    if(userId === 'wh8or4SeGKKr5WTDs' || this.userId){
        return Companies.find({_id: id});
    }
    else {
        return this.ready();
    }
});