import { VZ } from '/imports/startup/both/namespace';
import { Teams } from '/imports/api/teams/teams';
import './all-teams.html';


Template.allTeams.onCreated(function () {
    this.checkedTeams = new ReactiveArray([]);
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
    this.autorun(function () {
        Template.currentData();
    });
});

Template.allTeams.onRendered(function () {
    var self = this;
    $('#teams-table').DataTable({
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
    var table = $('#teams-table').DataTable();

    table.on('draw', function(e) {
        self.autorun(function () {
            self.checkedTeams.list();
        });
        // self.updateDataTableSelectAllCtrl(table);
    });
    this.autorun(function () {
        self.checkedTeams.list();
        self.updateDataTableSelectAllCtrl(table);
    });
});

Template.allTeams.helpers({
    teams: function () {
        return Teams.find({archived: false}).fetch();
        // return _.sortBy(teams, function (team) {
        //     return team.name.toLowerCase();
        // });
    },
    formatIsPrivate: function (isPrivate) {
        return isPrivate ? 'Yes' : 'No';
    },
    userName(userId){
        return Meteor.users.findOne({_id: userId}, {
            fields: {profile: 1, roles: 1, emails: 1}
        }).profile.fullName;
    },
    isChecked: function () {
        var id = this._id;
        var checkedTeams = Template.instance().checkedTeams.list();
        var index = checkedTeams.indexOf(id);
        return index !== -1;
    },
    isCheckedTeams: function () {
        return Template.instance().checkedTeams.list().length > 0;
    },
    checkedCount: function () {
        return Template.instance().checkedTeams.list().length
    }
});

Template.allTeams.events({
    'click #select-all': function (event, tmpl) {
        event.preventDefault();
        var allChecked = $('tbody input[type="checkbox"]', '#teams-table').prop('checked', this.checked);
        var isAllChecked = $(event.currentTarget).prop('checked');
        var checkedTeams = tmpl.checkedTeams.list();
        if (isAllChecked) {

            _.each(allChecked, function(element, elementIndex, list) {
                var index = checkedTeams.indexOf($(element).attr('id'));
                if (index == -1) {
                    checkedTeams.push($(element).attr('id'));
                }
            });
        }
        else {
            _.each(allChecked, function(element, elementIndex, list) {
                var index = checkedTeams.indexOf($(element).attr('id'));
                if (index !== -1) {
                    checkedTeams.remove($(element).attr('id'));
                }
            });
        }
    },
    'click [name=table-item]': function (event, tmpl) {
        var id = this._id;
        var checkedTeams = tmpl.checkedTeams.list();
        var checked = $(event.currentTarget).prop('checked');
        var index = checkedTeams.indexOf(id);
        if (index == -1) {
            checkedTeams.push(id);
        }
        else {
            checkedTeams.remove(id);
        }
    },
    'click #table_search': function (event, tmpl) {
        event.preventDefault();
        $('#teams-table_filter').toggleClass('active');
        $('#table_search').toggleClass('active');
    },
    'click .remove': function (event, tmpl) {
        event.preventDefault();
        tmpl.checkedTeams.clear();
    },
    'click #archive-teams': function (event, tmpl) {
        event.preventDefault();
        var table = $('#teams-table').DataTable();
        var checkedTeams = tmpl.checkedTeams.array();
        Session.set('teamsFormChanged',  false);
        Meteor.call('archiveTeams', checkedTeams, function (error, result) {
            if(!error){
                VZ.notify('Archived');
                tmpl.checkedTeams.clear();
                Session.set('teamsFormChanged',  true);
            }
            else {
                VZ.notify(error.message);
                Session.set('teamsFormChanged',  true);
            }
        });
    },
    'click .add-new': function(event, template) {
        ga('send', 'event', 'create-team', 'vezio-work');
        return true;
    }
});
