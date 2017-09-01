import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Screenshots } from '/imports/api/screenShots/screenShots';
import { Projects } from '/imports/api/projects/projects';
import { Tasks } from '/imports/api/tasks/tasks';
import { Tools } from '/imports/api/tools/tools';
import { Workplaces } from '/imports/api/workPlaces/workPlaces';
import { Conversations } from '/imports/api/conversations/conversations';
import { Messages } from '/imports/api/messages/messages';
import { VZ } from '/imports/startup/both/namespace';

Meteor.methods({
    resetDb: function () {
        debugger;
        Meteor.users.remove({});

        var activateAccount = function (userId) {
            var user = Meteor.users.find(userId).fetch()[0];

            if (user.emails && user.emails.length != 0) {
                var emails = user.emails;
                emails[0].verified = true;
                Meteor.users.update({_id: userId}, {$set: {'emails': emails}})
            }
        };

        VZ.Server.DummyDocuments.users.admins.forEach(function (admin) {
            var userId = Accounts.createUser(admin);

            Roles.addUsersToRoles(userId, 'admin', Roles.GLOBAL_GROUP);
            activateAccount(userId);
        });

        VZ.Server.DummyDocuments.users.users.forEach(function (user) {
            var userId = Accounts.createUser(user);
            Roles.addUsersToRoles(userId, 'user', Roles.GLOBAL_GROUP);
            activateAccount(userId);
        });

        var users = Meteor.users.find().fetch();

        var createEntityWithAssignedUsers = function (params) {
            params.targetCollection.remove({});

            params.entities.forEach(function (entity) {
                entity[params.adminPosition.targetPropertyName] = users[0]._id;

                var entityId = params.targetCollection.insert(entity);

                Roles.addUsersToRoles(entity[params.adminPosition.targetPropertyName], params.adminPosition.roles, entityId);

                var workersIndexes = [];
                for (var i = 1; i < users.length; i++) {
                    workersIndexes.push(i);
                }
                workersIndexes = _.shuffle(workersIndexes);

                var updateQueryWithUsers = {};
                params.usersPositions.forEach(function (userPosition, index) {
                    var userId = users[workersIndexes[index]]._id;
                    updateQueryWithUsers[userPosition.targetPropertyName] = updateQueryWithUsers[userPosition.targetPropertyName] || [];
                    updateQueryWithUsers[userPosition.targetPropertyName].push(userId);

                    Roles.addUsersToRoles(userId, userPosition.roles, entityId);
                });
                params.targetCollection.update(entityId, {$set: updateQueryWithUsers});
            });
        };

        createEntityWithAssignedUsers(VZ.Server.DummyDocuments.Companies);
        createEntityWithAssignedUsers(VZ.Server.DummyDocuments.Projects);
        createEntityWithAssignedUsers(VZ.Server.DummyDocuments.Teams);

        Tasks.remove({});
        VZ.Server.DummyDocuments.Tasks.forEach(function (task) {
            task.ownerId = Meteor.users.findOne({'profile.fullName': 'Abraham Lincoln'})._id;
            var id = Tasks.insert(task);
            Roles.addUsersToRoles(task.ownerId, 'task-owner', id);
        });

        // create workplaces and add tools to each workplace
        createEntityWithAssignedUsers(VZ.Server.DummyDocuments.Workplaces);

        var tools = Tools.find().fetch();
        tools = _.map(tools, function (tool) {
            return {
                _id: tool._id
            }
        });
        Workplaces.update({}, {$set: {tools: tools}}, {multi: true});


        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        TimeEntries.remove({});
        Screenshots.remove({});

        Meteor.users.find().forEach(function (user) {
            var userId = user._id;
            console.log(user);

            for (var i = 1; i < getRandomInt(0, 10); i++) {
                var timeEntryStartMoment = moment().subtract(getRandomInt(1000, 10000), 'minutes');
                var timeEntryEndMoment = moment(timeEntryStartMoment).add(getRandomInt(100, 1000),
                    'minutes');

                var timeEntry = {
                    message: 'Time entry without project',
                    startDate: timeEntryStartMoment.toDate(),
                    endDate: timeEntryEndMoment.toDate(),
                    userId: userId,
                    _done: true,
                    _isManual: false,
                    _totalMinutes: timeEntryEndMoment.diff(timeEntryStartMoment, 'minutes'),
                    _isActive: false,
                    _initiatedByDesktopApp: false,
                    _trackedByDesktopApp: false
                };

                var projectsIdsWhereAdmin = Roles.getGroupsForUser(userId, 'project-admin');
                var projectsIdsWhereManager = Roles.getGroupsForUser(userId, 'project-manager');
                var projectsIdsWhereWorker = Roles.getGroupsForUser(userId, 'project-worker');

                var projectsIds = _.union(projectsIdsWhereAdmin, projectsIdsWhereManager,
                    projectsIdsWhereWorker);

                if (projectsIds.length > 0) {
                    var projectId = projectsIds[getRandomInt(0, projectsIds.length - 1)];
                    console.log(projectsIds);
                    console.log(projectId);
                    var projectName = Projects.findOne(projectId).name;
                    _.extend(timeEntry, {
                        message: projectName,
                        projectId: projectId
                    })
                }

                TimeEntries.insert(timeEntry);
            }
        });


        // create dummy conversations
        Conversations.remove({});
        Messages.remove({});
        Meteor.users.find().forEach(function (conversationOwner) {
            var participants = Meteor.users.find({_id: {$ne: conversationOwner._id}}).fetch();
            var participantsIds = _.map(participants, function (participant) {
                return participant._id;
            });
            participantsIds = _.shuffle(participantsIds);
            participantsIds = participantsIds.slice(0, 3);

            var userId = conversationOwner._id;

            var conversationId = Conversations.insert({
                title: conversationOwner.profile.firstName + '\'s conversation',
                ownerId: userId,
                participantsIds: participantsIds,
                isPrivate: false
            });

            Roles.addUsersToRoles(userId, ['conversation-owner', 'conversation-member'], conversationId);
            Roles.addUsersToRoles(participantsIds, ['conversation-member'], conversationId);
        });

        return true;
    }
});