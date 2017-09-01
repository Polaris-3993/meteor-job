import './attachments-modal.html';
import './files-dropzone/files-dropzone';
import './images-dropzone/images-dropzone';
import './videos-dropzone/videos-dropzone';

Template.taskAttachmentsModal.onCreated(function () {
    this.attachmentsCurrentTab = new ReactiveVar('imagesDropZone');

});

Template.taskAttachmentsModal.onRendered(function () {
    var self = this;
    this.$('#attachemnets-modal').modal();
    this.$('#attachemnets-modal').modal('open');

    this.$('ul.tabs').tabs();
    this.autorun(function () {
        Template.currentData();
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
Template.taskAttachmentsModal.onDestroyed(function () {
    $('.lean-overlay').remove();
});

Template.taskAttachmentsModal.helpers({
    tab: function () {
        return Template.instance().attachmentsCurrentTab.get();
    }
});

Template.taskAttachmentsModal.events({
    'click #close-attachments-modal': function (event, tmpl) {
        event.preventDefault();
        tmpl.$('#attachemnets-modal').modal('close');
        removeTemplate(tmpl.view);
    },
    'click .tabs-select li': function (e, tmpl) {
        e.preventDefault();
        var attachmentsCurrentTab = $(e.target).closest('li');
        var templateName = attachmentsCurrentTab.data('template');
        tmpl.attachmentsCurrentTab.set(templateName);
    }
});

var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};