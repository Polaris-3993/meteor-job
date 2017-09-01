import './participant/participant';
import './participants-list.html';

Template.participantsListComponent.onCreated(function () {
});

Template.participantsListComponent.onRendered(function () {
});

Template.participantsListComponent.onDestroyed(function () {
});

Template.participantsListComponent.helpers({
    participants: function () {
        var participantsIds = this.conversation.participantsIds;
        participantsIds = _.union([this.conversation.ownerId], participantsIds);
        return Meteor.users.find({_id: {$in: participantsIds, $ne: Meteor.userId()}});
    },

    canAddNewPeople: function () {
        return this.conversation.ownerId == Meteor.userId() || this.conversation.isPrivate;
    }
});

Template.participantsListComponent.events({
    'click .add-participants': function (event, tmpl) {
        tmpl.data.changeComponent('addParticipant');
    },
    'click .cancel': function (event, tmpl) {
        tmpl.data.changeComponent('messagesRegular');
    }
});