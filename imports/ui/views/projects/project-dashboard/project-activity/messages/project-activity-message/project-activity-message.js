import { VZ } from '/imports/startup/both/namespace';
import { Projects } from '/imports/api/projects/projects';
import { ActivityMessages } from '/imports/api/activityMessages/activityMessages';
import './project-activity-message.html';

Template.projectActivityMessage.onCreated(function () {

});
Template.projectActivityMessage.helpers({
    profilePhoto: function () {
        var userId = this.userId;
        var user = Meteor.users.findOne({_id: userId}, {
            fields: {profile: 1}
        });
        if (!user || !user.profile) {
            return;
        }
        if (!user.profile.photo || !user.profile.photo.small) {
            return '/images/default-lockout.png'
        }

        return user.profile.photo.small;
    },
    authorName: function () {
        var userId = this.userId;
        var user = Meteor.users.findOne({_id: userId}, {
            fields: {profile: 1}
        });
        if (!user || !user.profile) {
            return;
        }
        return user.profile.fullName;
    },
    formatTime: function (timeToFormat) {
        return moment(timeToFormat).fromNow();
    },
    replyedMessages: function () {
        var replyedMessagesIds = this.replyedMessagesIds || [];
        return ActivityMessages.find({_id: {$in: replyedMessagesIds}}, {sort: {createdAt: -1}}).fetch();
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
Template.projectActivityMessage.events({
    'submit #reply-message-form': _.debounce(function (event, tmpl) {
        event.preventDefault();
        event.stopPropagation();

        var messageId = this._id;
        var projectId = tmpl.data && tmpl.data.projectId;
        var formClassName = event.target.className;
        var replyMessage = tmpl.$('#'+formClassName).val();
        if (!replyMessage) {
            return;
        }else {
            Meteor.call('addActivityReplyMessage', replyMessage, messageId, projectId, function (error, result) {
                if (error) {
                    VZ.notify(error.reason);
                }
                else {
                    tmpl.$('#'+formClassName).val('');
                }
            });
        }

    }, 300, true)
});