import { VZ } from '/imports/startup/both/namespace';
import './upload-background-photo-modal.html';

Template.uploadBackgroundPhotoModal.onCreated(function () {
    var self = this;
    this.photoToUpload = new ReactiveVar({});
    this.uploadBackgroundPhoto = function (file) {

        var reader = new FileReader();
        reader.onload = function (event) {
            var buffer = new Uint8Array(reader.result);

            Meteor.call('updateBackgroundPhoto', buffer, file.type, function (err, res) {

                if (err) {
                    VZ.notify('Failed to upload background photo');
                    self.data.onPhotoUpload(false);
                }
                else {
                    VZ.notify('Background photo uploaded!');
                    self.data.onPhotoUpload(false);
                }

            })

        };
        reader.readAsArrayBuffer(file);
    };
});
Template.uploadBackgroundPhotoModal.onRendered(function () {
    var self = this;
    this.$('.modal').modal();
    this.$('.modal').modal('open');

    Dropzone.autoDiscover = false;

    var dropzone = new Dropzone('#background-picture-drop-zone', {
        url: "/target-url",
        addRemoveLinks: true,
        maxFiles: 1,
        maxFilesize: 5,
        parallelUploads: 5,
        acceptedFiles: 'image/*',
        clickable: false,
        dictDefaultMessage: '',
        previewsContainer: '.dropzone-previews',

        accept: function (file, done) {
            self.photoToUpload.set(file);
            done();
        }

    });

    dropzone.on('addedfile', function (file) {
        var typeRegEx = /^image\/(jpeg|JPEG|png|PNG|gif|GIF|tif|TIF)$/;

        if (file.size >= 5 * 1000000) {
            dropzone.removeFile(file);
            VZ.notify('File too large! Limit 5MB');
        }
        if (!typeRegEx.test(file.type)) {
            dropzone.removeFile(file);
            VZ.notify('Wrong file type! Allowed jpeg, png, gif, tif');
        }

    });

    dropzone.on('maxfilesexceeded', function (file) {
        dropzone.removeFile(file);
    });

    $('.lean-overlay').on('click', function () {
        dropzone.destroy();
        removeTemplate(self.view);
    });
    document.addEventListener('keyup', function (e) {
        if (e.keyCode == 27) {
            dropzone.destroy();
            removeTemplate(self.view);
        }
    });
});
Template.uploadBackgroundPhotoModal.onDestroyed(function () {
    $('.lean-overlay').remove();
});

Template.uploadBackgroundPhotoModal.helpers({
    isPhotoToUpload: function () {
        return _.isEmpty(Template.instance().photoToUpload.get());
    }
});

Template.uploadBackgroundPhotoModal.events({
    'click .cancel': function (event, tmpl) {
        event.preventDefault();
        tmpl.$('#edit-background-picture').modal('close');
        removeTemplate(tmpl.view);
    },

    'click .save': function (event, tmpl) {
        event.preventDefault();
        tmpl.data.onPhotoUpload(true);
        var photoToUpload = tmpl.photoToUpload.get();
        if(_.isEmpty(photoToUpload)){
            VZ.notify('Select image');
            tmpl.data.onPhotoUpload(false);
            return;
        }
        tmpl.uploadBackgroundPhoto(photoToUpload);
        tmpl.$('#edit-background-picture').modal('close');
        removeTemplate(tmpl.view);
    },

    'change #background-photo-input': function (event, tmpl) {
        event.preventDefault();
        event.stopPropagation();
        tmpl.data.onPhotoUpload(true);
        var file = $(event.target).prop('files')[0];

        if (!photoValidation(file)) {
            tmpl.data.onPhotoUpload(false);
            return;
        }
        tmpl.uploadBackgroundPhoto(file);
        tmpl.$('#edit-background-picture').modal('close');
        removeTemplate(tmpl.view);
    }
});

var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};

var photoValidation = function (file) {
    if (!file) {
        return;
    }
    if (file.size >= 5 * 1000000) {
        VZ.notify('File too large! Limit 5MB');
        $('#background-photo-input').val('');
        return;
    }
    var typeRegEx = /^image\/(jpeg|JPEG|png|PNG|gif|GIF|tif|TIF)$/;
    if (!typeRegEx.test(file.type)) {
        VZ.notify('Wrong file type! Allowed jpeg, png, gif, tif');
        $('#background-photo-input').val('');
        return;
    }
    return true;
};