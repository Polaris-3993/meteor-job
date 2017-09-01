import './add-participant-modal.html';

Template.addParticipantModal.onCreated(function () {
    var self = this;

    this.closeModal = function () {
        self.$('.modal').modal('close');
        setTimeout(function () {
            Blaze.remove(self.view);
        }, 500);
    }
});

Template.addParticipantModal.onRendered(function () {
    this.$('.modal').modal();
    this.$('.modal').modal('open');

    var self = this;
    $('.lean-overlay').on('click', function () {
        self.closeModal();
    });
});

Template.addParticipantModal.onDestroyed(function () {
    $('.lean-overlay').remove();
});

Template.addParticipantModal.helpers({
    addParticipantOnActionCbs: function () {
        var tmpl = Template.instance();
        return {
            onAdd: function () {
                tmpl.closeModal();
            },
            onCancel: function () {
                tmpl.closeModal();
            }
        }
    }
});

Template.addParticipantModal.events({});