import './dropzone-view.html';
import { VZ } from '/imports/startup/both/namespace';

Template.dropzoneView.onRendered(function () {
    var self = this;
    var dropZoneFiles = [];
    Meteor.Dropzone.autoDiscover = false;

    var dropzone = new Dropzone('form#dropzone', {
        addRemoveLinks: true,
        maxFiles: 5,
        maxFilesize: 5,
        parallelUploads: 10,
        dictFileTooBig: 'File is to big ({{filesize}}MiB) and will not be uploaded! Max filesize: {{maxFilesize}}MiB.',
        dictMaxFilesExceeded: 'Can\'t add more than 5 files in a time',

        accept: function (file, done) {
            var reader = new FileReader();
            reader.onload = function (event) {
                var uploadData = {};
                var data = new Uint8Array(reader.result);
                uploadData.data = data;
                uploadData.name = file.name;
                uploadData.type = file.type;
                uploadData.size = file.size;
                uploadData.perms = 'publicRead';
                dropZoneFiles.push(uploadData);
                self.data.setFiles(dropZoneFiles);
            };
            reader.readAsArrayBuffer(file);
            done();
        }

    });
    dropzone.on('maxfilesexceeded', function (file) {
        VZ.notify('Can\'t upload more than 5 files in a time');
        dropzone.removeFile(file);
    });

    dropzone.on('removedfile', function (file) {
        if (file.status == 'success') {
            dropZoneFiles = _.reject(dropZoneFiles, function (currentFile) {
                return file.name == currentFile.name;
            });
            self.data.setFiles(dropZoneFiles);

        }
    });
});
