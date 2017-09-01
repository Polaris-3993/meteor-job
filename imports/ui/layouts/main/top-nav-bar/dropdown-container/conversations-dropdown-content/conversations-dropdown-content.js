import { Conversations } from '/imports/api/conversations/conversations';
import { Messages } from '/imports/api/messages/messages';
import './conversations-dropdown-content.html';

Template.conversationsDropdownContent.onCreated(function () {
    this.conversationQueryParams = new ReactiveVar({});

    this.filterConversationsByName = function (filterBy) {
        var query = {};
        if (filterBy) {
            var filterByRegEx = new RegExp(filterBy, 'i');
            query.$or = [{
                title: {$regex: filterByRegEx}
            }];

            var participantsIds = Meteor.users.find({'profile.fullName': {$regex: filterByRegEx}})
                .map(function (user) {
                    return user._id;
                });

            query.$or = _.union(query.$or, [{
                participantsIds: {$in: participantsIds}
            }, {
                ownerId: {$in: participantsIds}
            }]);
        }
        this.conversationQueryParams.set(query);
    };
    this.filterConversationsByName()
});

Template.conversationsDropdownContent.helpers({
    conversations: function () {
        var tmpl = Template.instance();
        var conversations = Conversations.find(tmpl.conversationQueryParams.get()).fetch();
        return _.sortBy(conversations, function (conversation) {
            var lastMessage = Messages.findOne({conversationId: conversation._id},
                {sort: {sentAt: -1}});
            return lastMessage ? lastMessage.sentAt : 0;
        }).reverse().slice(0, 5);
    }
});

Template.conversationsDropdownContent.events({
    'click .conversation-item': function (event, tmpl) {
        tmpl.data.closeDropDown();
    },

    'input .search-conversation-input': function (event, tmpl) {
        setTimeout(function () {
            var value = tmpl.$('.search-conversation-input').val();
            tmpl.filterConversationsByName(value);
        }, 50);
    }
});