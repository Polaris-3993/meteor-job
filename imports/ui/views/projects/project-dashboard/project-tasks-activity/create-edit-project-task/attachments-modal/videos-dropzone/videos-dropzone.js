import { VZ } from '/imports/startup/both/namespace';
import { Tasks } from '/imports/api/tasks/tasks';
import './videos-dropzone.html';

Template.videosDropZone.onCreated(function () {
    var self = this;
    this.videosToUpload = new ReactiveVar([]);
    this.autorun(function () {
        var data = Template.currentData();
        var newTaskFiles = data.newTaskFilesVar.get();
        self.videosToUpload.set(newTaskFiles);
    });
});

Template.videosDropZone.onRendered(function () {
    var self = this;

    this.$('ul.tabs').tabs();

    var taskId = this.data.taskId;

    $('#video-gallery').lightGallery({
        download:false,
        autoplay: false,
        autoplayControls: false,
        thumbnail: false,
        zoom: false,
        fullScreen: false,
        loadYoutubeThumbnail: true,
        youtubeThumbSize: 'default',
            youtubePlayerParams: {
                showinfo: 1,
                controls: 1
            }
    });


    Meteor.Dropzone.autoDiscover = false;

    var dropzone = new Dropzone('form#taskVideoAttachmentsForm', {
        url: "/target-url",
        addRemoveLinks: true,
        autoProcessQueue: true,
        maxFiles: 1,
        maxFilesize: 15,
        parallelUploads: 2,
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
        VZ.notify('Max upload  1 file in a time');
        dropzone.removeAllFiles();
    });
    dropzone.on('addedfile', function(file) {
        dropzone.removeFile(file);
        if (file.size >= 15 * 1000000) {
            VZ.notify('File ' + file.name + ' too large! Limit 10MB');
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
                VZ.notify('Uploading video');
                Meteor.call('uploadVideoP', uploadData, taskId, function (error, result) {
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
            var isVideo = (/video\//g).test(file.type);
            if(isVideo){
                reader.readAsArrayBuffer(file);
            }
            else {
                VZ.notify('Only video required');

            }
        }
    });

    this.autorun(function () {
        Template.currentData();
    });
});
Template.videosDropZone.onDestroyed(function () {
});

Template.videosDropZone.helpers({
    // isImage: function () {
    //     var fileName = this.fileName;
    //     return (/\.(gif|jpg|jpeg|tiff|png)$/i).test(fileName);
    // },
    isYouTubeVideo: function () {
        var fileName = this.mediaLink;
        return (/http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/g).test(fileName);
    },
    taskVideos: function () {
        var tmpl = Template.instance();
        var taskId = tmpl.data.taskId;
        var videosToUpload = tmpl.videosToUpload.get();
        var taskFiles;

        if(taskId == 'new-task'){
            taskFiles = videosToUpload;
        }
        else {
            var task = Tasks.findOne({_id: taskId});
            taskFiles = task && task.taskFiles || [];
        }
        taskFiles = _.filter(taskFiles, function(file){ return file.type && file.type == 'video' && !(/http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/g).test(file.mediaLink);});
        return taskFiles;
    },
    youTubeVideos: function () {
        var tmpl = Template.instance();
        var taskId = tmpl.data.taskId;
        var videosToUpload = tmpl.videosToUpload.get();
        var taskFiles;

        if(taskId == 'new-task'){
            taskFiles = videosToUpload;
        }
        else {
            var task = Tasks.findOne({_id: taskId});
            taskFiles = task && task.taskFiles || [];
        }
        taskFiles = _.filter(taskFiles, function(file){ return file.type && file.type == 'video' && (/http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/g).test(file.mediaLink)});
        return taskFiles;
    }
});

Template.videosDropZone.events({
    'keyup #you-tube-url': function (event, tmpl) {
        event.preventDefault();
        if(event.keyCode == 13){
            var url = tmpl.$(event.currentTarget).val();
            var taskId = tmpl.data.taskId;
            Meteor.call('addYoutubeVideo', url, taskId, function (error, result) {
                if(!error){
                    tmpl.$('#you-tube-url').val('');
                    if(taskId == 'new-task'){
                        tmpl.data.onAddFilesCb(result);
                    }
                }
                else {
                    VZ.notify(error.message);
                    tmpl.$('#you-tube-url').val('');
                }
            });
        }
    }
});

var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};