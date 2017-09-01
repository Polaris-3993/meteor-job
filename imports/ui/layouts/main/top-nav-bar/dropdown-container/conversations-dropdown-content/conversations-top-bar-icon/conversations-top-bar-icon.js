import { Messages } from '/imports/api/messages/messages';
import './conversations-top-bar-icon.html';

Template.conversationsTopBarIcon.onCreated(function () {
    this.subscribe('unreadMessages');

    this.unreadMessagesCount = new ReactiveVar();
    var lastUnreadMessagesCount = 0;

    var self = this;
    this.autorun(function () {
        var count = Messages.find({
            'readBy.participantId': {$ne: Meteor.userId()}
        }).count();

        lastUnreadMessagesCount = count;
        self.unreadMessagesCount.set(count);
    });
});

Template.conversationsTopBarIcon.onRendered(function () {

});

Template.conversationsTopBarIcon.helpers({
    unreadMessagesCount: function () {
        var count = Template.instance().unreadMessagesCount.get();
        return count > 10 ? '+10' : count;
    }
});