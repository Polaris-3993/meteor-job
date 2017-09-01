import { projectsSubs } from '/imports/startup/client/subManagers';
import { timeEntriesSubs } from '/imports/startup/client/subManagers';
import { VZ } from '/imports/startup/both/namespace';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Projects } from '/imports/api/projects/projects';
import { ActivityMessages } from '/imports/api/activityMessages/activityMessages';
import './project-activity.html';
import './messages/messages';

Template.projectActivity.onCreated(function () {
    var self = this;
    this.messageFile = new ReactiveVar({});
    this.autorun(function () {
        var data = Template.currentData();
        projectsSubs.subscribe('ProjectActivityMessages', data.project._id);
        timeEntriesSubs.subscribe('projectTimeEntries', data.project._id);
    });
});
Template.projectActivity.helpers({
    activityMessages: function () {
        var activityMessagesIds = this.project.activityMessagesIds || [];
        return ActivityMessages.find({_id: {$in: activityMessagesIds}}, {sort: {createdAt: -1}}).fetch();
    },
    formatTime: function (timeToFormat) {
        return moment(timeToFormat).fromNow();
    },
    assignedUsersCount: function () {
        return this.project.assignedUsersIds && this.project.assignedUsersIds.length;
    },
    timeTracked: function () {
        var projectId = this.project._id;
        var projectInfo = this.project && this.project.info;
        var tasksCount = projectInfo && projectInfo.tasksCount || 0;
        var tasksCompleted = projectInfo && projectInfo.tasksCompleted || 0;
        var project = Projects.findOne({_id: projectId});
        var projectData = {
            name: project.name,
            time: 0,
            tasks: {
                all: 0,
                completed: 0
            },
            totalSpendings: 0,
            people: project.assignedUsersIds ? project.assignedUsersIds.length + 1 : 0,
            lastUpdate: ''
        };
        var entries = TimeEntries.find({
            projectId: project._id
        }).fetch();

        _.each(entries, function (entry) {
            var diff = moment(entry.endDate).diff(entry.startDate, 'second');
            projectData.time += diff;
        });
        projectData.tasks.all = tasksCount;
        projectData.tasks.completed = tasksCompleted;
        return projectData;

    },
    templateName: function () {
        var messageType = this.type;
        if (messageType == 'project-activity-message') {
            return 'projectActivityMessage';
        }
        else if (messageType == 'user-changes-message' || messageType == 'project-created-message') {
            return 'notificationMessage';
        }
    },
    templateData: function () {
        this.projectId = Template.instance().data.project._id;
        return this;
    }
});
Template.projectActivity.events({
    'submit #activity-message': _.debounce(function (event, tmpl) {
        event.preventDefault();
        event.stopPropagation();

        var activityMessage = tmpl.$('#message-text').val();
        if (!activityMessage) {
            return;
        } else {
            var message = {message: activityMessage};
            var projectId = this.project._id;
            var messageFile = tmpl.messageFile.get();
            if (messageFile && messageFile.size > 0) {
                if (messageFile.size >= 5 * 1000000) {
                    VZ.notify('File too large! Limit 5MB');
                    $('#file-path').val('');
                    return;
                }
                Meteor.call('uploadMessageFile', messageFile, function (error, result) {
                    if (result) {
                        message.file = result;
                        Meteor.call('addActivityMessage', message, projectId, function (error, result) {
                            if (error) {
                                VZ.notify(error.reason);
                            }
                            else {
                                tmpl.$('#message-text').val('');
                            }
                        });
                    } else if (error) {
                        VZ.notify(error.message);
                    }
                });

            }
            else {
                Meteor.call('addActivityMessage', message, projectId, function (error, result) {
                    if (error) {
                        VZ.notify(error.reason);
                    }
                    else {
                        tmpl.$('#message-text').val('');
                    }
                });
            }


        }
    }, 500, true),
    'change #post-file': function (event, tmpl) {
        event.preventDefault();
        var file = $(event.target).prop('files')[0];
        var reader = new FileReader();
        reader.onload = function (event) {
            var uploadData = {};
            var data = new Uint8Array(reader.result);
            uploadData.data = data;
            uploadData.name = file.name;
            uploadData.type = file.type;
            uploadData.size = file.size;
            uploadData.perms = 'publicRead';
            tmpl.messageFile.set(uploadData);
        };
        reader.readAsArrayBuffer(file);
    }
});