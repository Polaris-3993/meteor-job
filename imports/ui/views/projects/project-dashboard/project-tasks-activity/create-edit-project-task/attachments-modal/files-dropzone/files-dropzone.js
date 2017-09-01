import { VZ } from '/imports/startup/both/namespace';
import { Tasks } from '/imports/api/tasks/tasks';
import './files-dropzone.html';


Template.filesDropZone.onCreated(function () {
    var self = this;
    this.filesToUpload = new ReactiveVar([]);
    this.autorun(function () {
        var data = Template.currentData();
        var newTaskFiles = data.newTaskFilesVar.get();
        self.filesToUpload.set(newTaskFiles);
    });
});

Template.filesDropZone.onRendered(function () {
    var self = this;

    this.$('ul.tabs').tabs();

    var taskId = this.data.taskId;
    $('#fileslightgallery').lightGallery({
        autoplayControls: false,
        fullScreen: false,
        zoom: false,
        thumbnail: false
    });


    Meteor.Dropzone.autoDiscover = false;

    var dropzone = new Dropzone('form#taskAttachmentsForm', {
        url: "/target-url",
        addRemoveLinks: true,
        autoProcessQueue: true,
        maxFiles: 5,
        maxFilesize: 5,
        parallelUploads: 10,
        clickable: false,
        dictDefaultMessage: '',
        previewsContainer: '.dropzone-previews',
        dictFileTooBig: 'File is to big ({{filesize}}MiB) and will not be uploaded! Max filesize: {{maxFilesize}}MiB.',
        dictMaxFilesExceeded: 'Can\'t add more than 5 files in a time',

        accept: function (file, done) {
            done();
        }

    });
    dropzone.on('maxfilesexceeded', function (file) {
        VZ.notify('Max upload  5 files in a time');
        dropzone.removeAllFiles();
    });
    dropzone.on('addedfile', function(file) {
        dropzone.removeFile(file);
        if (file.size >= 5 * 1000000) {
            VZ.notify('File ' + file.name + ' too large! Limit 5MB');
        }
        else {
            var reader = new FileReader();
            reader.onload = function (event) {
                var uploadData = {};
                var data = new Uint8Array(reader.result);
                uploadData.data = data;
                uploadData.name = file.name;
                uploadData.type = file.type;
                uploadData.size = file.size;
                uploadData.perms = 'publicRead';
                VZ.notify('Uploading files');
                Meteor.call('uploadTaskFileP', uploadData, taskId, function (error, result) {
                    if (result) {
                        VZ.notify('Uploaded ' + result.fileName);
                        if(taskId == 'new-task'){
                            self.data.onAddFilesCb(result);
                        }
                    }
                    else if (error) {
                        VZ.notify(error);
                    }
                });
            };
            var isImage = (/application\//g).test(file.type);

            if(isImage){
                reader.readAsArrayBuffer(file);
            }
            else {
                VZ.notify('Drop only files');

            }
        }
    });
});
Template.filesDropZone.onDestroyed(function () {
});

Template.filesDropZone.helpers({
    isImage: function () {
        var fileName = this.fileName;
        return (/\.(gif|jpg|jpeg|tiff|png)$/i).test(fileName);
    },
    taskFiles: function () {
        var tmpl = Template.instance();
        var taskId = tmpl.data.taskId;
        var filesToUpload = tmpl.filesToUpload.get();
        var taskFiles;

        if(taskId == 'new-task'){
            taskFiles = filesToUpload;
        }
        else {
            var task = Tasks.findOne({_id: taskId});
            taskFiles = task && task.taskFiles || [];
        }
        taskFiles = _.reject(taskFiles, function(file){ return file.type && file.type == 'video';});
        taskFiles = _.reject(taskFiles, function(file){ return (/\.(gif|jpg|jpeg|tiff|png)$/i).test(file.fileName);});

        return taskFiles;
    }
});

Template.filesDropZone.events({

});

var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};