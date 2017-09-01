import { VZ } from '/imports/startup/both/namespace';
import './archived-jobs.html';

Template.archivedJobs.onCreated(function () {
    this.archivedCheckedJobs = new ReactiveArray([]);
    this.updateDataTableSelectAllCtrl = function(table) {
        var $table = table.table().node();
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
    this.autorun(function () {
        Template.currentData();
    });
});
Template.archivedJobs.onRendered(function () {
    var self = this;
    $('select').material_select();
    $('#archived-jobs-table').DataTable({
        // data: self.data.projects,
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
        "bRetrieve": true,
        "bDestroy": true,
        'columnDefs': [{
            'targets': 6,
            'searchable': false,
            'orderable': false
        }],
        processing: false,
        scrollX: true
    });
    var table = $('#archived-jobs-table').DataTable();

    table.on('draw', function(e) {
        self.autorun(function () {
            self.archivedCheckedJobs.list();
        });
        // self.updateDataTableSelectAllCtrl(table);
    });
    this.autorun(function () {
        self.archivedCheckedJobs.list();
        self.updateDataTableSelectAllCtrl(table);
    });
});
Template.archivedJobs.helpers({
    isChecked: function () {
        var id = this._id;
        var archivedCheckedJobs = Template.instance().archivedCheckedJobs.list();
        var index = archivedCheckedJobs.indexOf(id);
        return index !== -1;
    },
    isCheckedJobs: function () {
        return Template.instance().archivedCheckedJobs.list().length > 0;
    },
    checkedCount: function () {
        return Template.instance().archivedCheckedJobs.list().length;
    },
    applicantsCount: function (applicantsIds) {
        return applicantsIds.length;
    },
    statusColorA: function (status) {
        return status == 'Opened' ? 'opened' :  status == 'Closed' ? 'closed' : status == 'Will expire soon' ? 'expiring' :'';
    },
    viewsCountA: function () {
        return this.viewerIds.length;
    }
});

Template.archivedJobs.events({
    'click #select-all': function (event, tmpl) {
        event.preventDefault();
        var allChecked = $('tbody input[type="checkbox"]', '#archived-jobs-table').prop('checked', this.checked);
        var isAllChecked = $(event.currentTarget).prop('checked');
        var archivedCheckedJobs = tmpl.archivedCheckedJobs.list();
        if (isAllChecked) {

            _.each(allChecked, function(element, elementIndex, list) {
                var index = archivedCheckedJobs.indexOf($(element).attr('id'));
                if (index == -1) {
                    archivedCheckedJobs.push($(element).attr('id'));
                }
            });
        }
        else {
            _.each(allChecked, function(element, elementIndex, list) {
                var index = archivedCheckedJobs.indexOf($(element).attr('id'));
                if (index !== -1) {
                    archivedCheckedJobs.remove($(element).attr('id'));
                }
            });
        }
    },
    'click [name=table-item]': function (event, tmpl) {
        var id = this._id;
        var archivedCheckedJobs = tmpl.archivedCheckedJobs.list();
        var checked = $(event.currentTarget).prop('checked');
        var index = archivedCheckedJobs.indexOf(id);
        if (index == -1) {
            archivedCheckedJobs.push(id);
        }
        else {
            archivedCheckedJobs.remove(id);
        }
    },
    'click #table_search': function (event, tmpl) {
        event.preventDefault();
        $('#archived-jobs-table_filter').toggleClass('active');
        $('#table_search').toggleClass('active');
    },
    'click .remove': function (event, tmpl) {
        event.preventDefault();
        tmpl.archivedCheckedJobs.clear();
    },
    'click #archive-jobs': function (event, tmpl) {
        event.preventDefault();
        var table = $('#archived-jobs-table').DataTable();
        var archivedCheckedJobs = tmpl.archivedCheckedJobs.array();
        Session.set('jobsFormChanged',  false);
        Meteor.call('restoreJobs', archivedCheckedJobs, function (error, result) {
            if(!error){
                VZ.notify('Restored');
                tmpl.archivedCheckedJobs.clear();
                Session.set('jobsFormChanged',  true);
            }
            else {
                VZ.notify(error.message);
            }
        });
    }
});