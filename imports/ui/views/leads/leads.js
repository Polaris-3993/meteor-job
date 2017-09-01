import { Leads } from '/imports/api/leads/leads';
import './leads.html';

Template.leads.onCreated(function () {
    this.checkedLeads = new ReactiveArray([]);
    this.leads = new ReactiveVar([]);
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
Template.leads.onRendered(function () {
    var self = this;
    // var table = $('#leads-table').DataTable();
    var table = $('#leads-table').DataTable({
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
        scrollX: true,
        bDeferRender: true
    });
    // var table = $('#leads-table').DataTable();

    var rows_selected = [];
    this.$('.dropdown-button').dropdown({
        inDuration: 100,
        outDuration: 125,
        constrain_width: false, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on hover
        gutter: 0, // Spacing from edge
        // belowOrigin: false, // Displays dropdown below the button
        alignment: 'right' // Displays dropdown with edge aligned to the left of button
    });

    table.on('draw', function(e) {
        self.autorun(function () {
            self.checkedLeads.list();
        });
        // self.updateDataTableSelectAllCtrl(table);
    });
    this.autorun(function () {
        self.checkedLeads.list();
        self.updateDataTableSelectAllCtrl(table);
    });
});

Template.leads.helpers({
   leads: function () {
       return Leads.find();
   },
    isChecked: function () {
       var id = this._id;
        var checkedLeads = Template.instance().checkedLeads.list();
        var index = checkedLeads.indexOf(id);

        return index !== -1;
    },
    isCheckedLeads: function () {
        return Template.instance().checkedLeads.list().length > 0;
    },
    checkedCount: function () {
        return Template.instance().checkedLeads.list().length
    }
});
Template.leads.events({
    'click #select-all': function (event, tmpl) {
        var allChecked = $('tbody input[type="checkbox"]', '#leads-table').prop('checked', this.checked);
        var isAllChecked = $(event.currentTarget).prop('checked');
        var checkedLeads = tmpl.checkedLeads.list();
        if (isAllChecked) {

            _.each(allChecked, function(element, elementIndex, list) {
                var index = checkedLeads.indexOf($(element).attr('id'));
                if (index == -1) {
                    checkedLeads.push($(element).attr('id'));
                }
            });
        }
        else {
            _.each(allChecked, function(element, elementIndex, list) {
                var index = checkedLeads.indexOf($(element).attr('id'));
                if (index !== -1) {
                    checkedLeads.remove($(element).attr('id'));
                }
            });
        }
    },
    'click [name=table-item]': function (event, tmpl) {
        var id = this._id;
        var checkedLeads = tmpl.checkedLeads.list();
        var checked = $(event.currentTarget).prop('checked');
        var index = checkedLeads.indexOf(id);
        if (index == -1) {
            checkedLeads.push(id);
        }
        else {
            checkedLeads.remove(id);
        }
    },
    'click #table_search': function (event, tmpl) {
        event.preventDefault();
        $('#leads-table_filter').toggleClass('active');
        $('#table_search').toggleClass('active');
    },
    'click .remove': function (event, tmpl) {
        event.preventDefault();
        tmpl.checkedLeads.clear();
    }
    // 'change [name="uploadCSV"]' ( event, template ) {
    //     event.preventDefault();
    //     Papa.parse( event.target.files[0], {
    //         header: true,
    //         complete( results, file ) {
    //             console.log(results.data);
    //             Meteor.call( 'parseUpload', results.data, ( error, response ) => {
    //                 if ( error ) {
    //                     VZ.notify(error.reason);
    //                 } else {
    //                     VZ.notify('Success');
    //                 }
    //             });
    //         }
    //     });
    // }
});

