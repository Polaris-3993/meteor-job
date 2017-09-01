import './filter-by-day-and-tip/filter-by-day-and-tip';
import './search-message-bar/search-message-bar';
import './messages-search.html';

import { Messages } from '/imports/api/messages/messages';

Template.messagesSearch.onCreated(function () {
    var self = this;

    this.shouldShowFilterSetting = new ReactiveVar(false);

    this.messageSearchParams = new ReactiveVar({
        conversationId: this.data.conversation._id,
        'deletedBy.participantId': {$ne: Meteor.userId()},
        text: ''
    });

    this.autorun(function () {
        var options = {
            sort: {sentAt: -1}
        };

        self.subscribe('messages', self.messageSearchParams.get(), options);
    });
});

Template.messagesSearch.helpers({
    foundMessages: function () {
        var params = Template.instance().messageSearchParams.get();
        return Messages.find(params, {sort: {sentAt: -1}});
    },

    foundMessagesNumber: function () {
        var params = Template.instance().messageSearchParams.get();
        return Messages.find(params).count();
    },

    shouldShowFilterSetting: function () {
        return Template.instance().shouldShowFilterSetting.get();
    },

    onChangeFilterByDay: function () {
        var tmpl = Template.instance();

        return function (value) {
            Tracker.nonreactive(function () {
                var currentParams = tmpl.messageSearchParams.get();
                switch (value) {
                    case 'allTime':
                        currentParams = _.omit(currentParams, 'sentAt');
                        break;
                    case 'today':
                        var startOfToday = moment().startOf('day').toDate();
                        currentParams.sentAt = {$gte: startOfToday};
                        break;
                    case 'week':
                        var startOfWeek = moment().startOf('week').toDate();
                        currentParams.sentAt = {$gte: startOfWeek};
                        break;
                    case 'month':
                        var startOfMonth = moment().startOf('month').toDate();
                        currentParams.sentAt = {$gte: startOfMonth};
                        break;
                }
                tmpl.messageSearchParams.set(currentParams);
            });
        }
    }
});

Template.messagesSearch.events({
    'click .search-back': function (event, tmpl) {
        tmpl.data.changeComponent('messagesRegular');
    },
    'click .search-filter': function (event, tmpl) {
        var currentVal = tmpl.shouldShowFilterSetting.get();
        tmpl.shouldShowFilterSetting.set(!currentVal);
    },

    // input text in search-input, that located in search-message-bar
    'input .search-input': _.debounce(function (event, tmpl) {
        var setMessageTextQueryParam = function (searchString) {
            var currnetParams = tmpl.messageSearchParams.get();

            if (searchString) {
                var regEx = {$regex: searchString, $options: 'gi'};
                currnetParams.text = regEx;
            } else {
                currnetParams.text = '';
            }

            tmpl.messageSearchParams.set(currnetParams);
        };

        var searchString = tmpl.$('.search-input').val();
        setMessageTextQueryParam(searchString);
    }, 500),

    // click on message item, that located in sub template
    'click .message-item': function (event, tmpl) {
        var messageId = event.currentTarget.id;

        // go to regular mode, and scroll to message that was clicked
        tmpl.data.scrollToMessage(messageId);
    }
});