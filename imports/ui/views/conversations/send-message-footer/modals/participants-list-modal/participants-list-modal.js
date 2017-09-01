import './participants-list-modal.html';
import './participant-list-modal-item/participant-list-modal-item';


Template.participantsListModal.onCreated(function () {
    var self = this;

    this.closeModal = function () {
        self.$('.modal').modal('close');
        setTimeout(function () {
            Blaze.remove(self.view);
        }, 500);
    }
});

Template.participantsListModal.onRendered(function () {
    var self = this;

    this.$('#participants-list-modal').modal();
    this.$('#participants-list-modal').modal('open');

    $('.lean-overlay').on('click', function () {
        self.closeModal();
    });
});

Template.participantsListModal.onDestroyed(function () {
    $('.lean-overlay').remove();
});

Template.participantsListModal.helpers({
    participants: function () {
        var participantsIds = this.conversation.participantsIds.slice(0);
        participantsIds.push(this.conversation.ownerId);

        return Meteor.users.find({
            _id: {
                $in: participantsIds,
                $ne: Meteor.userId()
            }
        });
    }
});

Template.participantsListModal.events({
    'click .close-modal-button': function (event, tmpl) {
        tmpl.closeModal();
    }
});