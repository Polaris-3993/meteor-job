import { Projects } from '/imports/api/projects/projects';
import { ActivityMessages } from '/imports/api/activityMessages/activityMessages';
import { VZ } from '/imports/startup/both/namespace';

export const addActivityMessage = new ValidatedMethod({
    name: 'addActivityMessage',
    validate: new SimpleSchema({
        message:   {type: String},
        projectId: {type: String},
    }).validator(),
    run({message, projectId}) {
        if (VZ.canUser('addActivityMessage', this.userId, projectId)) {
            message = _.extend(message, {
                type: 'project-activity-message',
                userId: this.userId,
                replyedMessagesIds: [],
                createdAt: new Date()
            });
            const id = ActivityMessages.insert(message);
            Projects.update({_id: projectId}, {$addToSet:{activityMessagesIds: id}});
        } else {
            throw new Meteor.Error('permission-error', 'You can\'t add messages!');
        }
    }
});

export const addActivityReplyMessage = new ValidatedMethod({
    name: 'addActivityReplyMessage',
    validate: new SimpleSchema({
        message:   {type: String},
        messageId: {type: String},
        projectId: {type: String},
    }).validator(),
    run({message, messageId ,projectId}) {
        const userId = this.userId;
        if (VZ.canUser('addActivityMessage', userId, projectId)) {
            const replyMessage = {
                message: message,
                type: 'reply-message',
                userId: this.userId,
                createdAt: new Date()
            };
            const id = ActivityMessages.insert(replyMessage);
            ActivityMessages.update({_id: messageId}, {$addToSet:{replyedMessagesIds: id}});
        } else {
            throw new Meteor.Error('permission-error', 'You can\'t add messages!');
        }
    }
});

export const addUserChangesMessage = new ValidatedMethod({
    name: 'addUserChangesMessage',
    validate: new SimpleSchema({
        status: {type: String},
        users:   {type: String},
        projectOwner: {type: String},
        projectId: {type: String},
    }).validator(),
    run({status, users, projectOwner, projectId}) {
        const userChangesMessage = {
            message: status,
            type: 'user-changes-message',
            userId: this.userId,
            projectOwner: projectOwner,
            createdAt: new Date()
        };
        if(status == 'users-added'){
            userChangesMessage.changedUsersIds = users.addedUsers
        }
        else if(status == 'users-removed'){
            userChangesMessage.changedUsersIds = users.removedUsers
        }

        const id = ActivityMessages.insert(userChangesMessage);
        Projects.update({_id: projectId}, {$addToSet:{activityMessagesIds: id}});
    }
});

export const addProjectCreatedMessage = new ValidatedMethod({
    name: 'addProjectCreatedMessage',
    validate: new SimpleSchema({
        status: {type: String},
        projectName: {type: String},
        projectOwner: {type: String},
        projectId: {type: String},
    }).validator(),
    run({status, projectName, projectOwner, projectId}) {
        const userId = this.userId;
        const userChangesMessage = {
            message: 'project-created',
            type: 'project-created-message',
            userId: userId,
            projectId: projectId,
            projectOwner: projectOwner,
            createdAt: new Date()
        };

        const id = ActivityMessages.insert(userChangesMessage);
        Projects.update({_id: projectId}, {$addToSet:{activityMessagesIds: id}});
    }
});
