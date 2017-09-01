import { Projects } from '/imports/api/projects/projects';
import './notification-message.html';

Template.notificationMessage.helpers({
    status: function () {
        var messageType = this.type;
        var status;
        if(messageType == 'user-changes-message'){
            var changedUsersIdsLength = this.changedUsersIds && this.changedUsersIds.length || 0;
            var message = changedUsersIdsLength > 1 ? 'User\'s' : 'User';
            if(this.message == 'users-added'){
                status = message + ' added to project';
            }
            else if(this.message == 'users-removed'){
                status = message + ' removed from project';
            }
        }
        else if(messageType == 'project-created-message'){
            status = 'Project created'
        }

        return status;
    },
    notification: function () {
        var messageType = this.type;
        if(messageType == 'user-changes-message') {
            var changedUsersIds = this.changedUsersIds || [];
            var users = Meteor.users.find({_id: {$in: changedUsersIds}}).fetch();
            var userNames = [];
            _.each(users, function (user) {
                userNames.push(user.profile.fullName);
            });
            userNames = userNames.join().replace(',', ', ');
            if (this.message == 'users-added') {
                return userNames + ' added to project';
            }
            else if (this.message == 'users-removed') {
                return userNames + ' removed from project';

            }
        }
        else if(messageType == 'project-created-message'){
            var projectId = this.projectId;
            var projectOwnerId = this.projectOwner;
            var project = Projects.findOne({_id: projectId});
            var projectOwner = Meteor.users.findOne({_id: projectOwnerId}, {fields: {profile: 1}});
            var projectName = project && project.name;
            var ownerName = projectOwner && projectOwner.profile.fullName;
            return 'Project '+projectName + ' was created by '+ownerName;
        }
    },
    isFirst: function () {
        var projectId = this.projectId;
        var messageId = this._id;
        var currentProject = Projects.findOne({_id: projectId});
        var activityMessagesIds = currentProject && currentProject.activityMessagesIds;
        var lastMessageId = _.last(activityMessagesIds);
        if(lastMessageId) {
            return messageId == lastMessageId ? 'first' : '';
        }
    }
});