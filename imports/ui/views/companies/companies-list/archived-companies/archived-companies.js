import { VZ } from '/imports/startup/both/namespace';
import './archived-companies.html';

Template.archivedCompanies.onCreated(function () {
    this.checkedCompanies = new ReactiveArray([]);
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
Template.archivedCompanies.onRendered(function () {
    var self = this;
    var table = $('#archived-companies-table').DataTable({
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
            'targets': 3,
            'searchable': false,
            'orderable': false
        }],
        processing: false,
        scrollX: true
    });

    table.on('draw', function(e) {
        self.autorun(function () {
            self.checkedCompanies.list();
        });
        // self.updateDataTableSelectAllCtrl(table);
    });
    this.autorun(function () {
        self.checkedCompanies.list();
        self.updateDataTableSelectAllCtrl(table);
    });
});


Template.archivedCompanies.helpers({
    userName(userId){
        var user = Meteor.users.findOne({_id: userId}, {
            fields: {profile: 1, roles: 1, emails: 1}
        });
        return user && user.profile && user.profile.fullName;
    },
    isChecked: function () {
        var id = this._id;
        var checkedCompanies = Template.instance().checkedCompanies.list();
        var index = checkedCompanies.indexOf(id);
        return index !== -1;
    },

    formatLocation: function (location) {
        if (location && location.city && location.country) {
            return location.city + ', ' + location.country;
        }
    },
    formatIsPrivate: function (isPrivate) {
        return isPrivate ? 'Yes' : 'No';
    },
    isCheckedCompanies: function () {
        return Template.instance().checkedCompanies.list().length > 0;
    },
    checkedCount: function () {
        return Template.instance().checkedCompanies.list().length
    }
});

Template.archivedCompanies.events({
    'click #select-all': function (event, tmpl) {
        event.preventDefault();
        var allChecked = $('tbody input[type="checkbox"]', '#archived-companies-table').prop('checked', this.checked);
        var isAllChecked = $(event.currentTarget).prop('checked');
        var checkedCompanies = tmpl.checkedCompanies.list();
        if (isAllChecked) {

            _.each(allChecked, function(element, elementIndex, list) {
                var index = checkedCompanies.indexOf($(element).attr('id'));
                if (index == -1) {
                    checkedCompanies.push($(element).attr('id'));
                }
            });
        }
        else {
            _.each(allChecked, function(element, elementIndex, list) {
                var index = checkedCompanies.indexOf($(element).attr('id'));
                if (index !== -1) {
                    checkedCompanies.remove($(element).attr('id'));
                }
            });
        }
    },
    'click [name=table-item]': function (event, tmpl) {
        var id = this._id;
        var checkedCompanies = tmpl.checkedCompanies.list();
        var checked = $(event.currentTarget).prop('checked');
        var index = checkedCompanies.indexOf(id);
        if (index == -1) {
            checkedCompanies.push(id);
        }
        else {
            checkedCompanies.remove(id);
        }
    },
    'click #table_search': function (event, tmpl) {
        event.preventDefault();
        $('#archived-companies-table_filter').toggleClass('active');
        $('#table_search').toggleClass('active');
    },
    'click .remove': function (event, tmpl) {
        event.preventDefault();
        tmpl.checkedCompanies.clear();
    },
    'click #restore-companies': function (event, tmpl) {
        event.preventDefault();
        var checkedCompanies = tmpl.checkedCompanies.array();
        Session.set('companiesFormChanged',  false);
        Meteor.call('restoreCompanies', checkedCompanies, function (error, result) {
            if(!error){
                VZ.notify('Restored');
                tmpl.checkedCompanies.clear();
                Session.set('companiesFormChanged',  true);
            }
            else {
                VZ.notify(error.message);
                Session.set('companiesFormChanged',  true);
            }
        });
    }
});