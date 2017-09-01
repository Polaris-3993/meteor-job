import { VZ } from '/imports/startup/both/namespace';
import { Projects } from '/imports/api/projects/projects';
import './create-edit-task.html';
import './create-edit-task-modal-proj';
import './tags/create-edit-tasks-tags';

Template.createEditTask.onCreated(function () {
    var tags = this.data && this.data.task && this.data.task.tags ? this.data.task.tags : [];

    this.tags = new ReactiveVar(tags);
    this.currentProjectId = new ReactiveVar('');
    this.taskFiles = new ReactiveVar([]);
});

Template.createEditTask.onRendered(function () {
    this.$('#startDate').pickadate({
        selectMonths: true,
        selectYears: 15
    });

    this.$('#dueDate').pickadate({
        selectMonths: true,
        selectYears: 15
    });
    this.$('.dropdown-button').dropdown();
    this.$('select').material_select();

    var self = this;
    var taskFiles = [];
    Meteor.Dropzone.autoDiscover = false;

    var dropzone = new Dropzone('form#createEditTaskForm', {
        url: '/target-url',
        addRemoveLinks: true,
        maxFiles: 5,
        maxFilesize: 5,
        parallelUploads: 10,
        clickable: false,
        dictDefaultMessage:'',
        previewsContainer: '.dropzone-previews',
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
                taskFiles.push(uploadData);
                self.taskFiles.set(taskFiles);
            };
            reader.readAsArrayBuffer(file);
            done();
        }

    });
    dropzone.on('maxfilesexceeded', function (file) {
        VZ.notify('Max upload  5 files in a time');
        dropzone.removeFile(file);
    });

    dropzone.on('removedfile', function (file) {
        if (file.status == 'success') {
            taskFiles = _.reject(taskFiles, function (currentFile) {
                return file.name == currentFile.name;
            });
            self.taskFiles.set(taskFiles);
        }
    });

    var startDatePicker = this.$('#startDate').pickadate('picker');
    var dueDatePicker = this.$('#dueDate').pickadate('picker');

    var minDateValue = this.data.task ? this.data.task.createdAt : new Date();
    startDatePicker.set('min', minDateValue);
    dueDatePicker.set('min', minDateValue);


    if (this.data.task) {
        startDatePicker.set('select', this.data.task.startDate);
        dueDatePicker.set('select', this.data.task.dueDate);

    }
});

Template.createEditTask.onDestroyed(function () {
});

Template.createEditTask.helpers({
    formTitle: function () {
        if (this && this.task) {
            return 'Edit task';
        }
        return 'Create task';
    }
});

Template.createEditTask.helpers({
    project: function () {
        var currentProjectId = Template.instance().currentProjectId.get();
        var project = Projects.findOne(currentProjectId);

        if (Template.instance().data.task && !currentProjectId) {
            return Projects.findOne({_id: Template.instance().data.task.projectId}).name;
        }
        else {
            if (project && project.name) {
                return project.name;
            }
            else {
                return 'Select project';
            }
        }
    },
    status: function () {
        if (Template.instance().data && Template.instance().data.task) {
            return Template.instance().data.task.status;
        }
        else {
            return false;
        }
    },
    tags: function () {
        return Template.instance().tags.get();
    },
    onReactiveVarSet: function () {
        var tmpl = Template.instance();
        return function (tags) {
            tmpl.tags.set(tags);
        }
    },
    selectedStatus: function (status) {
        var timeZone = Template.instance().data.task.status;
        return timeZone == status ? 'selected' : '';
    }
});

Template.createEditTask.events({
    'submit #createEditTaskForm': _.debounce(function (event, tmpl) {

        var getTaskDocument = function () {

            var name = tmpl.$('#name').val().trim();
            var description = tmpl.$('#description').val().trim();
            var tags = tmpl.tags.get();

            var startDatePicker = this.$('#startDate').pickadate('picker');
            var dueDatePicker = this.$('#dueDate').pickadate('picker');

            var startDate = new Date(startDatePicker.get());
            var dueDate = new Date(dueDatePicker.get());

            // var estimatedDuration = this.$('#estimatedDuration').val();

            // var task = tmpl.data.task || {};
            var task = {};

            task.name = name;
            task.startDate = startDate;
            task.dueDate = dueDate;
            task.status = 'Opened';
            // task.estimatedDuration = estimatedDuration;

            if (description) {
                task.description = description;
            }
            if (tags) {
                task.tags = tags;
            }
            return task;
        };

        event.preventDefault();
        var taskFiles = tmpl.taskFiles.get();
        var selectedProjectId = tmpl.currentProjectId.get();
        var taskStatus = tmpl.$('#task-status-select option:selected').val();

        tmpl.$('#submit-form-button').attr('disabled', 'disabled');

        var task = getTaskDocument();
        if (taskFiles.length > 0) {
            VZ.notify('Uploading files');
        }
        if (tmpl.data && tmpl.data.task) {
            task._id = tmpl.data.task._id;
            task.projectId = tmpl.data.task.projectId;
            task.status = taskStatus;
            Meteor.call('uploadFile', taskFiles, function (error, result) {
                if (result) {
                    Meteor.call('editTask', task, selectedProjectId, result, function (err) {
                        if (err) {
                            VZ.notify(err);
                            tmpl.$('#submit-form-button').removeAttr('disabled');
                        } else {
                            VZ.notify('Successfully updated!');
                            Router.go('tasks');
                        }
                    });
                }
                else if(error){
                    VZ.notify(error);
                }
            });

        } else {
            task.projectId = selectedProjectId;
            Meteor.call('uploadFile', taskFiles, function (error, result) {
                if (result) {
                    task.taskFiles = result;
                    Meteor.call('createTask', task, function (err) {
                        if (err) {
                            VZ.notify(err);
                            tmpl.$('#submit-form-button').removeAttr('disabled');
                        } else {
                            VZ.notify('Successfully created!');
                            Router.go('tasks');
                        }
                    });
                }
                else if(error){
                    VZ.notify(error);
                }
            });

        }
    }, 1000, true),

    'click .select-project': function (event, tmpl) {
        event.preventDefault();
        var parentNode = $('body')[0],
            onProjectSelected = function (projectId) {
                tmpl.currentProjectId.set(projectId);
            },
            modalData = {
                onProjectSelected: onProjectSelected
            };
        Blaze.renderWithData(Template.tasksProjectModalPicker, modalData, parentNode);
    },
    'click .dropdown-button': function (event, tmpl) {
        event.preventDefault();
        console.log('this', tmpl.$('.dropdown-button').dropdown());
    },
    'click .delete-file': function (event, tmpl) {
        event.preventDefault();
        Meteor.call('deleteTaskFile', tmpl.data.task._id, this.fileName, function (error) {
            if (error) {
                VZ.notify(error);
            }
            else {
                VZ.notify('Deleted');
            }
        });
    }
});
