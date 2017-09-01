import { VZ } from '/imports/startup/both/namespace';
import { Companies } from '/imports/api/companies/companies';
import './create-edit-project.html';
import './tags/create-edit-project-tags';

Template.createEditProject.onCreated(function () {
    var self = this;
    var tags = this.data && this.data.project ? this.data.project.tags : [];
    var companyId = this.data.project ? this.data.project.companyId : '';
    this.tags = new ReactiveVar(tags);
    this.projectFiles = new ReactiveVar([]);
    this.selectedCompanyId = new ReactiveVar(companyId);
    this.autorun(function () {
        self.subscribe('Companies', {_id: self.selectedCompanyId.get()});
    });
});

Template.createEditProject.onRendered(function () {
    var self = this;
    var projectFiles = [];
    Meteor.Dropzone.autoDiscover = false;

    var dropzone = new Dropzone('form#createEditProjectForm', {
        url: "/target-url",
        addRemoveLinks: true,
        maxFiles: 5,
        maxFilesize: 5,
        parallelUploads: 10,
        clickable: false,
        dictDefaultMessage: '',
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
                projectFiles.push(uploadData);
                self.projectFiles.set(projectFiles);
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
            projectFiles = _.reject(projectFiles, function (currentFile) {
                return file.name == currentFile.name;
            });
            self.projectFiles.set(projectFiles);
        }
    });
});

Template.createEditProject.onDestroyed(function () {
});

Template.createEditProject.helpers({
    formTitle: function () {
        if (this && this.project) {
            return 'Edit project';
        }
        return 'Create project';
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
    assignedUsers: function () {
        return Template.instance().assignedUsers.list();
    },
    availableCompaniesIds: function () {
        var companiesWhereUserIsManager = Roles.getGroupsForUser(Meteor.userId(), 'company-manager');
        var companiesWhereUserIsAdmin = Roles.getGroupsForUser(Meteor.userId(), 'company-admin');

        return _.union(companiesWhereUserIsAdmin, companiesWhereUserIsManager);
    },
    onCompanySelectCb: function () {
        var tmpl = Template.instance();
        return function (companyId) {
            tmpl.selectedCompanyId.set(companyId);
        }
    },
    selectedCompany: function () {
        var companyId = Template.instance().selectedCompanyId.get();
        var company = Companies.findOne(companyId);
        // console.log(company);
        return company ? company : {};
    }
});

Template.createEditProject.events({
    'click #cancel-button': function (event, tmpl) {
        event.preventDefault();
        Router.go('projects');
    },

    'submit #createEditProjectForm': _.debounce(function (event, tmpl) {
        event.preventDefault();
        event.stopPropagation();
        var selectedProjectKey = tmpl.$('#project-key').val().trim();
        var companyId = tmpl.selectedCompanyId.get();
        var projectFiles = tmpl.projectFiles.get() || [];
        var getProjectDocument = function () {

            var name = tmpl.$('#name').val().trim();
            var description = tmpl.$('#description').val().trim();
            var tags = tmpl.tags.get();
            // var attachments = tmpl.$('#attachments').val();

            var project = {};
            project.budget = 0;
            project.name = name;
            project.projectKey = selectedProjectKey;
            project.companyId = companyId;

            if (description) {
                project.description = description;
            }
            if (tags) {
                project.tags = tags;
            }
            // if (attachments) {
            //     //project.attachments = attachments;
            // }
            return project;
        };
        tmpl.$('#submit-form-button').attr('disabled', 'disabled');

        var project = getProjectDocument();
        if (projectFiles.length > 0) {
            VZ.notify('Uploading files');
        }
        if (tmpl.data && tmpl.data.project) {
            project._id = tmpl.data.project._id;
            project.assignedUsersIds = tmpl.data.project.assignedUsersIds;
            project.projectKey = tmpl.data.project.projectKey;
            Meteor.call('uploadFile', projectFiles, function (error, result) {
                if (result) {
                    Meteor.call('updateProject', project, selectedProjectKey, result, function (err) {
                        if (err) {
                            VZ.notify(err);
                            tmpl.$('#submit-form-button').removeAttr('disabled');
                        } else {
                            VZ.notify('Successfully updated!');
                            Router.go('projects');
                        }
                    });
                }
                else if (error) {
                    VZ.notify(error);
                }
            });

        } else {
            Meteor.call('uploadFile', projectFiles, function (error, result) {
                if (result) {
                    project.projectFiles = result;
                    Meteor.call('createProject', project, function (error, result) {
                        if (error) {
                            VZ.notify(error);
                            tmpl.$('#submit-form-button').removeAttr('disabled');
                        } else if (result) {
                            VZ.notify('Successfully created!');
                            Router.go('projects');
                        }
                    });
                }
                else if (error) {
                    VZ.notify(error);
                }
            });


        }
    }, 1000, true),

    'click .delete-file': function (event, tmpl) {
        event.preventDefault();
        Meteor.call('deleteProjectFile', tmpl.data.project._id, this.fileName, function (error) {
            if (error) {
                VZ.notify(error);
            }
            else {
                VZ.notify('Deleted');
            }
        });
    }
});
