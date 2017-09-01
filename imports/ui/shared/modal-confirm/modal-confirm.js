import './modal-confirm.html';

import { VZ } from '/imports/startup/both/namespace';
// Renders modal.
/*
 @params
 message - string
 onConfirm - function to run onConfirm
 onCancel - function to run onCancel
 */


VZ.UI.confirmModal = function (params) {
    var parentNode = $('body')[0];
    Blaze.renderWithData(Template.modalConfirm, params, parentNode);
};

Template.modalConfirm.onRendered(function () {
    var self = this;

    this.$('#modalConfirm').modal();
    this.$('#modalConfirm').modal('open');

    $('.lean-overlay').on('click', function () {
        removeTemplate(self.view);
    });

});

Template.modalConfirm.onDestroyed(function () {
    $('.lean-overlay').remove();
});

Template.modalConfirm.events({
    'click .confirm': function (e, template) {
        e.preventDefault();
        if (template.data.onConfirm) {
            template.data.onConfirm();
        }
        removeTemplate(template.view);
    },
    'click .cancel': function (e, template) {
        e.preventDefault();
        if (template.data.onCancel) {
            template.data.onCancel();
        }
        removeTemplate(template.view);
    }

});

var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};

