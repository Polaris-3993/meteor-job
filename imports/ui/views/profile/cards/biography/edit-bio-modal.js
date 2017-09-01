import { VZ } from '/imports/startup/both/namespace';
import './edit-bio-modal.html';

Template.editBioModal.onCreated(function () {
    // $('#your-bio').trigger('autoresize');
});
Template.editBioModal.onRendered(function () {
    var self = this;
    this.$('.modal').modal();
    this.$('.modal').modal('open');
    this.$('#your-bio').trigger('autoresize');
    this.$('select').material_select();


    this.autorun(function () {

    });
    $('.lean-overlay').on('click', function () {
        removeTemplate(self.view);
    });
    document.addEventListener('keyup', function (e) {
        if (e.keyCode == 27) {
            removeTemplate(self.view);
        }
    });
});
Template.editBioModal.onDestroyed(function () {
    $('.lean-overlay').remove();
});

Template.editBioModal.helpers({

});

Template.editBioModal.events({
    'click .cancel': function (event, tmpl) {
        event.preventDefault();
        tmpl.$('#edit-bio-modal').modal('close');
        removeTemplate(tmpl.view);
    },
    'click .save': function (event, tmpl) {
        event.preventDefault();
        var bio = tmpl.$('#your-bio').val();
        Meteor.call('editBiography', bio, function (err, res) {
            if (err) {
                VZ.notify('Failed');
            }
        });
        tmpl.$('#edit-bio-modal').modal('close');
        removeTemplate(tmpl.view);
    }
});

var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};