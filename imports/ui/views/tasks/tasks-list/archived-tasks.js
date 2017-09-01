import { VZ } from '/imports/startup/both/namespace';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Projects } from '/imports/api/projects/projects';
import { Tasks } from '/imports/api/tasks/tasks';
import './archived-tasks.html';

Template.archivedTasks.onCreated(function () {
    this.checkedArchivedTasks = new ReactiveArray([]);
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

Template.archivedTasks.onRendered(function () {
    var self = this;
    var table = $('#archived-tasks-table').DataTable({
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
            self.checkedArchivedTasks.list();
        });
        // self.updateDataTableSelectAllCtrl(table);
    });
    this.autorun(function () {
        self.checkedArchivedTasks.list();
        self.updateDataTableSelectAllCtrl(table);
    });
});
Template.archivedTasks.onDestroyed(function () {
});
Template.archivedTasks.helpers({
    tasks: function () {
        return Tasks.find({archived: true});
    },
    isChecked: function () {
        var id = this._id;
        var checkedArchivedTasks = Template.instance().checkedArchivedTasks.list();
        var index = checkedArchivedTasks.indexOf(id);
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
        return Template.instance().checkedArchivedTasks.list().length > 0;
    },
    checkedCount: function () {
        return Template.instance().checkedArchivedTasks.list().length
    }
});

Template.archivedTasks.events({
    'click #select-all': function (event, tmpl) {
        event.preventDefault();
        var allChecked = $('tbody input[type="checkbox"]', '#archived-tasks-table').prop('checked', this.checked);
        var isAllChecked = $(event.currentTarget).prop('checked');
        var checkedArchivedTasks = tmpl.checkedArchivedTasks.list();
        if (isAllChecked) {
            _.each(allChecked, function(element, elementIndex, list) {
                var index = checkedArchivedTasks.indexOf($(element).attr('id'));
                if (index == -1) {
                    checkedArchivedTasks.push($(element).attr('id'));
                }
            });
        }
        else {
            _.each(allChecked, function(element, elementIndex, list) {
                var index = checkedArchivedTasks.indexOf($(element).attr('id'));
                if (index !== -1) {
                    checkedArchivedTasks.remove($(element).attr('id'));
                }
            });
        }
    },
    'click [name=table-item]': function (event, tmpl) {
        var id = this._id;
        var checkedArchivedTasks = tmpl.checkedArchivedTasks.list();
        var checked = $(event.currentTarget).prop('checked');
        var index = checkedArchivedTasks.indexOf(id);
        if (index == -1) {
            checkedArchivedTasks.push(id);
        }
        else {
            checkedArchivedTasks.remove(id);
        }
    },
    'click #table_search': function (event, tmpl) {
        event.preventDefault();
        $('#archived-tasks-table_filter').toggleClass('active');
        $('#table_search').toggleClass('active');
    },
    'click .remove': function (event, tmpl) {
        event.preventDefault();
        tmpl.checkedArchivedTasks.clear();
    },
    'click #restore-tasks': function (event, tmpl) {
        event.preventDefault();
        var checkedTasks = tmpl.checkedArchivedTasks.array();
        Session.set('tasksFormChanged',  false);
        Meteor.call('restoreTasks', checkedTasks, function (error, result) {
            if(!error){
                VZ.notify('Restored');
                tmpl.checkedArchivedTasks.clear();
                Session.set('tasksFormChanged',  true);
            }
            else {
                VZ.notify(error.message);
            }
        });
    }
});

