import './message/message';
import './messages-list.html';

import { Messages } from '/imports/api/messages/messages';

Template.messagesList.onCreated(function () {
    var self = this;

    // search last read message for each participant
    this.lastReadMessagesByEachUser = new ReactiveVar([]);
    this.autorun(function () {
        var conversation = self.data.conversation;
        var conversationId = conversation._id;
        var participantsIds = conversation.participantsIds.slice(0);
        participantsIds.push(conversation.ownerId);
        participantsIds = _.reject(participantsIds, function (id) {
            return id == Meteor.userId();
        });

        var lastReadMessages = [];
        participantsIds.forEach(function (participantId) {
            var lastReadMessage = Messages.findOne({
                conversationId: conversationId,
                'readBy.participantId': participantId
            }, {sort: {sentAt: -1}});
            if (lastReadMessage) {
                lastReadMessages.push({messageId: lastReadMessage._id, readBy: participantId});
            }
        });
        self.lastReadMessagesByEachUser.set(lastReadMessages);
    });
});

Template.messagesList.onRendered(function () {
    // if regular mode
    if (this.data.afterAllMessagesReRendered) {
        var self = this;

        var afterMessagesRender = _.debounce(function () {
            self.data.afterAllMessagesReRendered();
        }, 200);

        this.autorun(function () {
            Template.currentData().messages.count();
            Tracker.afterFlush(function(){
                afterMessagesRender();
            })
        });
    }
});

Template.messagesList.helpers({
    messagesGroupByDays: function () {
        var messages = _.sortBy(this.messages.fetch(), function (message) {
            return message.sentAt;
        });

        var messagesGroupByDaysObj = _.groupBy(messages, function (message) {
            return moment(message.sentAt).startOf('day').format('YYYY-MM-DD');
        });

        var messagesGroupByDays = [];
        _.each(messagesGroupByDaysObj, function (value, key) {
            messagesGroupByDays.push({date: key, messages: value});
        });
        return messagesGroupByDays;
    },

    formatMessageGroupDate: function (date) {
        var compareMomentsByStartOf = function (moment1, moment2, startOf) {
            var moment1StartOf = moment(moment1).startOf(startOf);
            var moment2StartOf = moment(moment2).startOf(startOf);
            return moment1StartOf.diff(moment2StartOf, 'days') == 0;
        };


        var messageGroupMoment = moment(date);
        var currentMoment = moment();

        if (compareMomentsByStartOf(messageGroupMoment, currentMoment, 'day')) {
            return 'Today';
        } else if (compareMomentsByStartOf(messageGroupMoment, currentMoment, 'week')) {
            return messageGroupMoment.format('dddd');
        } else if (compareMomentsByStartOf(messageGroupMoment, currentMoment, 'year')) {
            return messageGroupMoment.format('MMMM DD');
        } else {
            return messageGroupMoment.format('MMMM DD, YYYY');
        }
    },

    lastReadMessagesByEachUser: function () {
        return Template.instance().lastReadMessagesByEachUser.get();
    }
});

Template.messagesList.events({});