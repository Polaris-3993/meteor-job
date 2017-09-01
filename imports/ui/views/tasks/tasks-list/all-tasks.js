import { VZ } from '/imports/startup/both/namespace';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Projects } from '/imports/api/projects/projects';
import { Tasks } from '/imports/api/tasks/tasks';
import './all-tasks.html';

Template.allTasks.onCreated(function () {
    this.checkedTasks = new ReactiveArray([]);
    this.updateDataTableSelectAllCtrl = function(table) {
        var $table             = table.table().node();
        var $chkboxAll = $('tbody input[type="checkbox"]', table.table().container());
        var $chkboxChecked = $('tbody input[type="checkbox"]:checked', table.table().container());
        var chkboxSelectAll = $('thead input[name="select-all"]', table.table().container()).get(0);
        if ($chkboxChecked.length === 0) {
            chkboxSelectAll.checked = false;
            if ('indeterminate' in chkboxSelectAll) {
                chkboxSelectAll.indeterminate = false;
            }
        }
        else if ($chkboxChecked.length === $chkboxAll.length) {
            chkboxSelectAll.checked = true;
            if ('indeterminate' in chkboxSelectAll) {
                chkboxSelectAll.indeterminate = false;
            }
        }
        else {
            chkboxSelectAll.checked = true;
            if ('indeterminate' in chkboxSelectAll) {
                chkboxSelectAll.indeterminate = true;
            }
        }
    };
});

Template.allTasks.onRendered(function () {
    var self = this;
    var table = $('#tasks-table').DataTable({
        responsive:true,
        "dom": '<"top"f>rt<"bottom"pil><"clear">',
        "oLanguage": {
            "sInfo": "_START_-_END_ of _TOTAL_",
            "sLengthMenu": '<span>Rows per page:</span><select class="browser-default">' +
            '<option value="10">10</option>' +
            '<option value="20">20</option>' +
            '<option value="30">30</option>' +
            '<option value="40">40</option>' +
            '<option value="50">50</option>' +
            '<option value="-1">All</option>' +
            '</select></div>'
        },
        'columnDefs': [{
            'targets': 7,
            'searchable': false,
            'orderable': false
        }],
        processing: false,
        scrollX: true
    });

    table.on('draw', function(e) {
        self.autorun(function () {
            self.checkedTasks.list();
        });
        // self.updateDataTableSelectAllCtrl(table);
    });

    this.autorun(function () {
        self.checkedTasks.list();
        self.updateDataTableSelectAllCtrl(table);
    });
});

Template.allTasks.helpers({
    tasks: function () {
        return Tasks.find({archived: false});
    },
    isChecked: function () {
        var id = this._id;
        var checkedTasks = Template.instance().checkedTasks.list();
        var index = checkedTasks.indexOf(id);
        return index !== -1;
    },
    timeTracked: function () {
        var timeTracked = 0;
        var entryName = this.taskKey + ': ' + this.name;
        var projectId = this.projectId;
        var entries = TimeEntries.find({
            projectId: projectId,
            message: entryName
        }).fetch();
        _.each(entries, function (entry) {
            timeTracked += moment(entry.endDate).diff(entry.startDate, 'second');
        });
        return timeTracked;
    },
    projectName: function () {
        var project = Projects.findOne({_id: this.projectId});
        return project && project.name;
    },
    isCheckedTasks: function () {
        return Template.instance().checkedTasks.list().length > 0;
    },
    checkedCount: function () {
        return Template.instance().checkedTasks.list().length
    }
});

Template.allTasks.events({
    'click #select-all': function (event, tmpl) {
        event.preventDefault();
        var allChecked = $('tbody input[type="checkbox"]', '#tasks-table').prop('checked', this.checked);
        var isAllChecked = $(event.currentTarget).prop('checked');
        var checkedTasks = tmpl.checkedTasks.list();
        if (isAllChecked) {

            _.each(allChecked, function(element, elementIndex, list) {
                var index = checkedTasks.indexOf($(element).attr('id'));
                if (index == -1) {
                    checkedTasks.push($(element).attr('id'));
                }
            });
        }
        else {
            _.each(allChecked, function(element, elementIndex, list) {
                var index = checkedTasks.indexOf($(element).attr('id'));
                if (index !== -1) {
                    checkedTasks.remove($(element).attr('id'));
                }
            });
        }
    },
    'click [name=table-item]': function (event, tmpl) {
        var id = this._id;
        var checkedTasks = tmpl.checkedTasks.list();
        var checked = $(event.currentTarget).prop('checked');
        var index = checkedTasks.indexOf(id);
        if (index == -1) {
            checkedTasks.push(id);
        }
        else {
            checkedTasks.remove(id);
        }
    },
    'click #table_search': function (event, tmpl) {
        event.preventDefault();
        $('#tasks-table_filter').toggleClass('active');
        $('#table_search').toggleClass('active');
    },
    'click .remove': function (event, tmpl) {
        event.preventDefault();
        tmpl.checkedTasks.clear();
    },
    'click #archive-tasks': function (event, tmpl) {
        event.preventDefault();
        var table = $('#tasks-table').DataTable();
        var checkedTasks = tmpl.checkedTasks.array();
        Session.set('tasksFormChanged',  false);
        Meteor.call('archiveTasks', checkedTasks, function (error, result) {
            if(!error){
                VZ.notify('Archived');
                tmpl.checkedTasks.clear();
                Session.set('tasksFormChanged',  true);
            }
            else {
                VZ.notify(error.message);
            }
        });
    },
    'click #task-name': function (event, tmpl) {
        event.preventDefault();
        var taskId = this._id;
        var projectId = this.projectId;
        Session.set('taskId', taskId);
        Router.go('projectDashboard', {id: projectId});
    }
});

