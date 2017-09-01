import './messages-regular.html';

import { VZ } from '/imports/startup/both/namespace';
import { Messages } from '/imports/api/messages/messages';

Template.messagesRegular.onCreated(function () {
    // default values
    this.messagesQuery = new ReactiveVar({});

    this.messagesListPageNumber = new ReactiveVar(0);
    this.isDno = false;

    this.actionOnMessagesReRendered = this.data.messageToScrollId
        ? 'scrollToMessageById' : 'scrollToBottom';
    this.wasScrolledToMessageById = false;
    this.allowLoadMore = true;

    var self = this;

    this.autorun(function () {
        var pageNumber = self.messagesListPageNumber.get();

        var processResult = function (err, res) {
            if (err) {
                VZ.notify(err);
            } else {
                var query = {
                    conversationId: self.data.conversation._id,
                    'deletedBy.participantId': {$ne: Meteor.userId()}
                };

                if (!res) {
                    query = _.omit(query, 'sentAt');
                }
                else {
                    _.extend(query, res.query);
                    self.isDno = res.isDno;

                    if (_.isNumber(res.pageNumber)) {
                        self.messagesListPageNumber.curValue = res.pageNumber;
                    }
                }

                self.messagesQuery.set(query);
            }
        };

        if (self.data.messageToScrollId && !self.wasScrolledToMessageById) {
            Meteor.call('getMessagesQuery', self.data.conversation._id,
                self.data.messageToScrollId, true, processResult);
        } else {
            Meteor.call('getMessagesQuery', self.data.conversation._id,
                pageNumber, processResult);
        }
    });

    this.autorun(function () {
        var query = self.messagesQuery.get();

        if (!_.isEmpty(query)) {
            self.subscribe('messages', query);
        }
    });

    this.readAllMessages = _.debounce(function () {
        Meteor.call('readAllMessages', self.data.conversation._id);
    }, 1000, true);
    this.readAllMessages();

    this.loadMessages = _.debounce(function (olderMessages) {
        var isDno = self.isDno;
        if (olderMessages && isDno) {
            return;
        }

        var currVal = self.messagesListPageNumber.get();
        var newVal = olderMessages ? ++currVal : --currVal;
        newVal = newVal < 0 ? 0 : newVal;
        self.messagesListPageNumber.set(newVal);
    }, 300, true);
});

Template.messagesRegular.onRendered(function () {
    var self = this;
    var targetMessage = null;
    var lastTopMessageId = null;

    this.afterAllMessagesReRendered = function () {
        var $scrollableContent = self.$('.scrollable-content');
        var action = self.actionOnMessagesReRendered;

        switch (action) {
            case 'scrollToLastTop':
                self.actionOnMessagesReRendered = null;
                targetMessage = self.$('#' + lastTopMessageId);
                if (targetMessage.length > 0) {
                    $scrollableContent.scrollTo(targetMessage[0]);
                }
                lastTopMessageId = self.$('.top-message').attr('id');
                break;
            case 'scrollToLastBottom':
                lastTopMessageId = self.$('.top-message').attr('id');
                break;
            case 'scrollToBottom':
                lastTopMessageId = self.$('.top-message').attr('id');

                var bottomPosition = $scrollableContent.prop('scrollHeight');
                $scrollableContent.scrollTop(bottomPosition);
                self.allowLoadMore = true;
                break;
            case 'scrollToMessageById':
                self.actionOnMessagesReRendered = null;
                self.wasScrolledToMessageById = true;
                targetMessage = self.$('#' + self.data.messageToScrollId);
                if (targetMessage.length > 0) {
                    $scrollableContent.scrollTo(targetMessage[0]);
                }
                lastTopMessageId = self.$('.top-message').attr('id');
                break;
        }
    }
});

Template.messagesRegular.helpers({
    messages: function () {
        var tmpl = Template.instance();
        var query = tmpl.messagesQuery.get();

        return Messages.find(query, {sort: {sentAt: -1}});
    },

    isMessagesReady: function () {
        var tmpl = Template.instance();
        var query = tmpl.messagesQuery.get();

        return !_.isEmpty(query);
    },

    oldestMessageId: function () {
        var tmpl = Template.instance();
        var query = tmpl.messagesQuery.get();
        var message = Messages.findOne(query, {sort: {sentAt: 1}});
        return message ? message._id : null;
    },

    afterAllMessagesReRenderedCb: function () {
        var tmpl = Template.instance();

        return tmpl.afterAllMessagesReRendered ?
            tmpl.afterAllMessagesReRendered : function () {
        }
    }
});

Template.messagesRegular.events({
    'keypress .message-input': function (event, tmpl) {
        if (event.keyCode == 13) {
            var text = event.target.value;
            if (text.length > 0) {
                var conversationId = tmpl.data.conversation._id;
                Meteor.call('sendMessage', conversationId, text, function (error, res) {
                    if (error) {
                        VZ.notify(error.message);
                    } else {
                        $(event.target).val('');
                        tmpl.allowLoadMore = false;
                        tmpl.messagesListPageNumber.set(0);
                        tmpl.actionOnMessagesReRendered = 'scrollToBottom';
                        setTimeout(function () {
                            tmpl.allowLoadMore = true;
                        }, 1000);
                    }
                });
            }
        }
    },

    'click .message-input': function (event, tmpl) {
        tmpl.readAllMessages();
    },

    'scroll .scrollable-content': function (event, tmpl) {
        tmpl.readAllMessages();

        if (!tmpl.allowLoadMore) {
            return;
        }

        var $scrollableContent = $(event.target);
        var scrollTop = event.target.scrollTop;
        var scrollHeight = $scrollableContent.prop('scrollHeight');
        var bottomScrollPosition = scrollHeight - $scrollableContent.height();

        if (scrollTop == 0) {
            tmpl.loadMessages(true);
            tmpl.actionOnMessagesReRendered = 'scrollToLastTop';
        } else if (scrollTop == bottomScrollPosition) {
            tmpl.loadMessages(false);
            tmpl.actionOnMessagesReRendered = 'scrollToLastBottom';
        } else {
            tmpl.actionOnMessagesReRendered = 'null';
        }

    }
});