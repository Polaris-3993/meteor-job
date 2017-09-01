import './ended-contracts.html';
import { Tasks } from '/imports/api/tasks/tasks';
import { Contracts } from '/imports/api/contracts/contracts';

Template.endedContracts.onCreated(function () {
    this.checkedContracts = new ReactiveArray([]);
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
Template.endedContracts.onRendered(function () {
    var self = this;
    var table = $('#ended-contracts-table').DataTable({
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
        processing: false,
        scrollX: true
    });

    table.on('draw', function(e) {
        self.autorun(function () {
            self.checkedContracts.list();
        });
    });
    this.autorun(function () {
        self.checkedContracts.list();
        self.updateDataTableSelectAllCtrl(table);
    });
});
Template.endedContracts.helpers({
    userName(userId){
        // var user =
        return Meteor.users.findOne({_id: userId}, {
            fields: {profile: 1, roles: 1, emails: 1}
        }).profile.fullName;
    },
    contracts: function () {
        return Contracts.find({status: 'ended'});
    },
    isChecked: function () {
        var id = this._id;
        var checkedTasks = Template.instance().checkedContracts.list();
        var index = checkedTasks.indexOf(id);
        return index !== -1;
    },
    isCheckedContracts: function () {
        return Template.instance().checkedContracts.list().length > 0;
    },
    checkedCount: function () {
        return Template.instance().checkedContracts.list().length
    }
});

Template.endedContracts.events({
    'click #select-all': function (event, tmpl) {
        event.preventDefault();
        var allChecked = $('tbody input[type="checkbox"]', '#ended-contracts-table').prop('checked', this.checked);
        var isAllChecked = $(event.currentTarget).prop('checked');
        var checkedContracts = tmpl.checkedContracts.list();
        if (isAllChecked) {

            _.each(allChecked, function(element, elementIndex, list) {
                var index = checkedContracts.indexOf($(element).attr('id'));
                if (index == -1) {
                    checkedContracts.push($(element).attr('id'));
                }
            });
        }
        else {
            _.each(allChecked, function(element, elementIndex, list) {
                var index = checkedContracts.indexOf($(element).attr('id'));
                if (index !== -1) {
                    checkedContracts.remove($(element).attr('id'));
                }
            });
        }
    },
    'click [name=table-item]': function (event, tmpl) {
        var id = this._id;
        var checkedContracts = tmpl.checkedContracts.list();
        var checked = $(event.currentTarget).prop('checked');
        var index = checkedContracts.indexOf(id);
        if (index == -1) {
            checkedContracts.push(id);
        }
        else {
            checkedContracts.remove(id);
        }
    },
    'click #table_search': function (event, tmpl) {
        event.preventDefault();
        $('#ended-contracts-table_filter').toggleClass('active');
        $('#table_search').toggleClass('active');
    },
    'click .remove': function (event, tmpl) {
        event.preventDefault();
        tmpl.checkedContracts.clear();
    }
});