import { Messages } from '/imports/api/messages/messages';
import './conversation-item.html';

Template.conversationItem.onCreated(function () {
    this.subscribe('unreadMessages', this.data.conversation._id);

    // subscribe on last message
    var self = this;
    this.autorun(function () {
        self.subscribe('messages', self.data.conversation._id,
            {limit: 1, sort: {sentAt: -1}});
    });
});

Template.conversationItem.helpers({
    lastMessage: function () {
        var conversationId = this.conversation._id;
        return Messages.findOne({
            conversationId: conversationId,
            'deletedBy.participantId': {$ne: Meteor.userId()}
        }, {sort: {sentAt: -1}});
    },
    hasUnreadMessages: function () {
        var conversationId = this.conversation._id;
        return Messages.find({
                conversationId: conversationId,
                'readBy.participantId': {$ne: Meteor.userId()}
            }).count() > 0;
    },

    messageDate: function (sentAt) {
        if (moment(sentAt).startOf('day').toString()
            == moment().startOf('day').toString()) {
            return moment(sentAt).format('HH:mm');
        } else if (moment(sentAt).startOf('week').toString()
            == moment().startOf('week').toString()) {
            return moment(sentAt).format('dddd');
        } else if (moment(sentAt).startOf('year').toString()
            == moment().startOf('year').toString()) {
            return moment(sentAt).format('MM.DD');
        } else {
            return moment(sentAt).format('MM.DD.YY');
        }
    },

    // for group conversation
    otherParticipantsIds: function () {
        var allParticipantsIds = this.conversation.participantsIds.slice(0);

        allParticipantsIds.push(this.conversation.ownerId);

        return _.reject(allParticipantsIds, function (partId) {
            return partId == Meteor.userId();
        }).slice(0, 4);
    },

    // for lib
    participantId: function () {
        var allParticipants = this.conversation.participantsIds.slice(0);
        return _.reject(allParticipants, function (partId) {
            return partId == Meteor.userId();
        })[0];
    }
});

Template.conversationItem.events({
    'click li': function (event, tmpl) {
        var conversationId = tmpl.data.conversation._id;
        Meteor.call('openConversationWindow', conversationId);
    }
});