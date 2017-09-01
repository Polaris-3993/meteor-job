import { Projects } from '/imports/api/projects/projects';
import { Tasks } from '/imports/api/tasks/tasks';
import { Contracts } from '/imports/api/contracts/contracts';
import { JobCategories } from '/imports/api/jobCategories/jobCategories';
import { Skills } from '/imports/api/skills/skills';
import { Jobs } from '/imports/api/jobs/jobs';
import { Leads } from '/imports/api/leads/leads';
import { Companies } from '/imports/api/companies/companies';
import { Teams } from '/imports/api/teams/teams';
import Tabular from 'meteor/aldeed:tabular';

TabularTables = {};

TabularTables.Projects = new Tabular.Table({
    name: 'Projects',
    responsive: true,
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
    scrollX: true,
    initComplete: function(settings, json) {
        var header = settings.aoHeader[0];
        var $firstTh = header[0].cell;
        var $firstThCheckbox = $('<input type="checkbox" class="filled-in" id="select-all" name="select_all"/><label for="select-all"></label>');
        $($firstTh).append($firstThCheckbox);
        header.shift();
        header.pop();
        _.each(header, function (element, index, list) {
            var $sortSpan = $('<span class="sort"><a href="#"><i class="material-icons">keyboard_arrow_up</i></a>'+
                '<a href="#"><i class="material-icons">keyboard_arrow_down</i></a>'+
                '</span>');
            $(element.cell).append($sortSpan);
        });
    },
    'columnDefs': [{
        'targets': 0,
        'searchable': false,
        'orderable': false,
        // 'width': '1%',
        // 'className': 'dt-body-center',
        'render': function (data, type, full, meta){
            return '<input type="checkbox" ' + ' class='+'"filled-in"'+ ' id='+'"'+full._id+'"'+'/'+'>' +'<label for='+'"'+full._id+'"'+'></label>';
        }
    }],
    processing: false,
    collection: Projects,
    columns: [
        {
            tmpl: Meteor.isClient && Template.datatableCheckBox
        },
        {data: "name", title: "Name"},
        {data: "description", title: "Description"},
        {data: "projectKey", title: "Key"},
        {
            data: "tags", title: "Tags",
            render: function (val, type, doc) {
                if (val && val.length > 0) {
                    return val.join().replace(/,/gi, ', ');
                }
            }
        },
        {
            data: "createdAt", title: "Created",
            render: function (val, type, doc) {
                return moment(val).format('L');
            }
        },
        {
            data: "assignedUsersIds", title: "Assigned to",
            tmpl: Meteor.isClient && Template.assignedUsers,
        },
        {
            tmpl: Meteor.isClient && Template.projectActions
        }
    ]
});
TabularTables.ArchivedProjects = new Tabular.Table({
    name: 'ArchivedProjects',
    responsive: true,
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
    scrollX: true,
    initComplete: function(settings, json) {
        var header = settings.aoHeader[0];
        var $firstTh = header[0].cell;
        var $firstThCheckbox = $('<input type="checkbox" class="filled-in" id="select-all" name="select_all"/><label for="select-all"></label>');
        $($firstTh).append($firstThCheckbox);
        header.shift();
        header.pop();
        _.each(header, function (element, index, list) {
            var $sortSpan = $('<span class="sort"><a href="#"><i class="material-icons">keyboard_arrow_up</i></a>'+
                '<a href="#"><i class="material-icons">keyboard_arrow_down</i></a>'+
                '</span>');
            $(element.cell).append($sortSpan);
        });
    },
    'columnDefs': [{
        'targets': 0,
        'searchable': false,
        'orderable': false,
        // 'width': '1%',
        // 'className': 'dt-body-center',
        'render': function (data, type, full, meta){
            return '<input type="checkbox" ' + ' class='+'"filled-in"'+ ' id='+'"'+full._id+'"'+'/'+'>' +'<label for='+'"'+full._id+'"'+'></label>';
        }
    }],
    processing: false,
    collection: Projects,
    columns: [
        {
            tmpl: Meteor.isClient && Template.datatableCheckBox
        },
        {data: "name", title: "Name"},
        {data: "description", title: "Description"},
        {data: "projectKey", title: "Key"},
        {
            data: "tags", title: "Tags",
            render: function (val, type, doc) {
                if (val && val.length > 0) {
                    return val.join().replace(/,/gi, ', ');
                }
            }
        },
        {
            data: "createdAt", title: "Created",
            render: function (val, type, doc) {
                return moment(val).format('L');
            }
        },
        {
            data: "assignedUsersIds", title: "Assigned to",
            tmpl: Meteor.isClient && Template.assignedUsers,
        },
        {
            tmpl: Meteor.isClient && Template.archivedProjectsActions
        }
    ]
});

TabularTables.Tasks = new Tabular.Table({
    name: 'Tasks',
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
    collection: Tasks,
    scrollX: true,
    initComplete: function(settings, json) {
        var header = settings.aoHeader[0];
        var $firstTh = header[0].cell;
        var $firstThCheckbox = $('<input type="checkbox" class="filled-in" id="select-all" name="select_all"/><label for="select-all"></label>');
        $($firstTh).append($firstThCheckbox);
        header.shift();
        header.pop();
        _.each(header, function (element, index, list) {
            var $sortSpan = $('<span class="sort"><a href="#"><i class="material-icons">keyboard_arrow_up</i></a>'+
                '<a href="#"><i class="material-icons">keyboard_arrow_down</i></a>'+
                '</span>');
            $(element.cell).append($sortSpan);
        });

    },
    'columnDefs': [{
        'targets': 0,
        'searchable': false,
        'orderable': false,
        // 'width': '1%',
        // 'className': 'dt-body-center',
        'render': function (data, type, full, meta){
            return '<input type="checkbox" ' + ' class='+'"filled-in"'+ ' id='+'"'+full._id+'"'+'/'+'>' +'<label for='+'"'+full._id+'"'+'></label>';
        }
    }],
    columns: [
        {
            tmpl: Meteor.isClient && Template.datatableCheckBox
        },
        {data: "name", title: "Name"},
        {data: "status", title: "Status"},
        {data: "taskKey", title: "Key"},
        {
            data: "projectId", title: "Project",
            render: function (val, type, doc) {
                var project = Projects.findOne({_id: val});
                return project && project.name;
            }
        },
        {
            data: "_id", title: "Time tracked",
            tmpl: Meteor.isClient && Template.timeTracked

        },
        {data: "membersIds", title: "Assigned to",
            tmpl: Meteor.isClient && Template.assignedTaskUsers
        },
        {
            data: "createdAt", title: "Created",
            render: function (val, type, doc) {
                return moment(val).format('L');
            }
        },
        {
            tmpl: Meteor.isClient && Template.taskActions,
            tmplContext(rowData) {
                return {
                    isArchived: false,
                    data: rowData
                };
            }
        }
    ]
});

TabularTables.ArchivedTasks = new Tabular.Table({
    name: 'Tasks',
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
    collection: Tasks,
    scrollX: true,
    initComplete: function(settings, json) {
        var header = settings.aoHeader[0];
        var $firstTh = header[0].cell;
        var $firstThCheckbox = $('<input type="checkbox" class="filled-in" id="select-all" name="select_all"/><label for="select-all"></label>');
        $($firstTh).append($firstThCheckbox);
        header.shift();
        header.pop();
        _.each(header, function (element, index, list) {
            var $sortSpan = $('<span class="sort"><a href="#"><i class="material-icons">keyboard_arrow_up</i></a>'+
                '<a href="#"><i class="material-icons">keyboard_arrow_down</i></a>'+
                '</span>');
            $(element.cell).append($sortSpan);
        });

    },
    'columnDefs': [{
        'targets': 0,
        'searchable': false,
        'orderable': false,
        // 'width': '1%',
        // 'className': 'dt-body-center',
        'render': function (data, type, full, meta){
            return '<input type="checkbox" ' + ' class='+'"filled-in"'+ ' id='+'"'+full._id+'"'+'/'+'>' +'<label for='+'"'+full._id+'"'+'></label>';
        }
    }],
    columns: [
        {
            tmpl: Meteor.isClient && Template.datatableCheckBox
        },
        {data: "name", title: "Name"},
        {data: "status", title: "Status"},
        {data: "taskKey", title: "Key"},
        {
            data: "projectId", title: "Project",
            render: function (val, type, doc) {
                var project = Projects.findOne({_id: val});
                return project && project.name;
            }
        },
        {
            data: "_id", title: "Time tracked",
            tmpl: Meteor.isClient && Template.timeTracked

        },
        {data: "membersIds", title: "Assigned to",
            tmpl: Meteor.isClient && Template.assignedTaskUsers
        },
        {
            data: "createdAt", title: "Created",
            render: function (val, type, doc) {
                return moment(val).format('L');
            }
        },
        {
            tmpl: Meteor.isClient && Template.taskActions,
            tmplContext(rowData) {
                return {
                    isArchived: true,
                    data: rowData
                };
            }
        }
    ]
});

TabularTables.Companies = new Tabular.Table({
    name: 'Companies',
    responsive: true,
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
    scrollX: true,
    initComplete: function(settings, json) {
        var header = settings.aoHeader[0];
        var $firstTh = header[0].cell;
        var $firstThCheckbox = $('<input type="checkbox" class="filled-in" id="select-all" name="select_all"/><label for="select-all"></label>');
        $($firstTh).append($firstThCheckbox);
        header.shift();
        header.pop();
        _.each(header, function (element, index, list) {
            var $sortSpan = $('<span class="sort"><a href="#"><i class="material-icons">keyboard_arrow_up</i></a>'+
                '<a href="#"><i class="material-icons">keyboard_arrow_down</i></a>'+
                '</span>');
            $(element.cell).append($sortSpan);
        });
    },
    'columnDefs': [{
        'targets': 0,
        'searchable': false,
        'orderable': false,
        // 'width': '1%',
        // 'className': 'dt-body-center',
        'render': function (data, type, full, meta){
            return '<input type="checkbox" ' + ' class='+'"filled-in"'+ ' id='+'"'+full._id+'"'+'/'+'>' +'<label for='+'"'+full._id+'"'+'></label>';
        }
    }],

    processing: false,
    collection: Companies,
    columns: [
        {
            tmpl: Meteor.isClient && Template.datatableCheckBox
        },
        {data: "name", title: "Name"},
        {data: "description", title: "Description"},
        {data: "location", title: "Location",
            render: function (val, type, doc) {
                if (val && val.city && val.country) {
                    return val.city + ', ' + val.country;
                }
            }
        },
        {data: "isPrivate", title: "Private",
            render: function (val, type, doc) {
                return val ? 'Yes' : 'No';
            }},
        {data: "ownerId", title: "Owner",
            tmpl: Meteor.isClient && Template.companyOwner
        },
        {data: "workersIds", title: "Workers",
            tmpl: Meteor.isClient && Template.companyWorkers
        },
        {data: "createdAt", title: "Created",
            render: function (val, type, doc) {
                return moment(val).format('L');
            }
        },
        {
            tmpl: Meteor.isClient && Template.companyActions
        }
    ]
});

TabularTables.Teams = new Tabular.Table({
    name: 'Teams',
    responsive: true,
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
    scrollX: true,
    initComplete: function(settings, json) {
        var header = settings.aoHeader[0];
        var $firstTh = header[0].cell;
        var $firstThCheckbox = $('<input type="checkbox" class="filled-in" id="select-all" name="select_all"/><label for="select-all"></label>');
        $($firstTh).append($firstThCheckbox);
        header.shift();
        header.pop();
        _.each(header, function (element, index, list) {
            var $sortSpan = $('<span class="sort"><a href="#"><i class="material-icons">keyboard_arrow_up</i></a>'+
                '<a href="#"><i class="material-icons">keyboard_arrow_down</i></a>'+
                '</span>');
            $(element.cell).append($sortSpan);
        });
    },
    'columnDefs': [{
        'targets': 0,
        'searchable': false,
        'orderable': false,
        // 'width': '1%',
        // 'className': 'dt-body-center',
        'render': function (data, type, full, meta){
            return '<input type="checkbox" ' + ' class='+'"filled-in"'+ ' id='+'"'+full._id+'"'+'/'+'>' +'<label for='+'"'+full._id+'"'+'></label>';
        }
    }],

    processing: false,
    collection: Teams,
    columns: [
        {
            tmpl: Meteor.isClient && Template.datatableCheckBox
        },
        {data: "name", title: "Name"},
        {data: "description", title: "Description"},
        {data: "isPrivate", title: "Private",
            render: function (val, type, doc) {
                return val ? 'Yes' : 'No';
            }},
        {data: "ownerId", title: "Owner",
            tmpl: Meteor.isClient && Template.teamLead
        },
        {data: "membersIds", title: "Assigned to",
            tmpl: Meteor.isClient && Template.assignedTeamUsers
        },
        {
            tmpl: Meteor.isClient && Template.teamActions
        }
    ]
});

TabularTables.Contracts = new Tabular.Table({
    name: 'Contracts',
    responsive: true,
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
    scrollX: true,
    initComplete: function(settings, json) {
        var header = settings.aoHeader[0];
        var $firstTh = header[0].cell;
        var $firstThCheckbox = $('<input type="checkbox" class="filled-in" id="select-all" name="select_all"/><label for="select-all"></label>');
        $($firstTh).append($firstThCheckbox);
        header.shift();
        _.each(header, function (element, index, list) {
            var $sortSpan = $('<span class="sort"><a href="#"><i class="material-icons">keyboard_arrow_up</i></a>'+
                '<a href="#"><i class="material-icons">keyboard_arrow_down</i></a>'+
                '</span>');
            $(element.cell).append($sortSpan);
        });
    },
    'columnDefs': [{
        'targets': 0,
        'searchable': false,
        'orderable': false,
        // 'width': '1%',
        // 'className': 'dt-body-center',
        'render': function (data, type, full, meta){
            return '<input type="checkbox" ' + ' class='+'"filled-in"'+ ' id='+'"'+full._id+'"'+'/'+'>' +'<label for='+'"'+full._id+'"'+'></label>';
        }
    }],

    processing: false,
    collection: Contracts,
    columns: [
        {
            tmpl: Meteor.isClient && Template.datatableCheckBox
        },
        {data: "name", title: "Name"},
        {data: "description", title: "Description"},

        {data: "paymentInfo.rate", title: "Rate"},
        {data: "paymentInfo.type", title: "Type"},
        {data: "paymentInfo.weekHoursLimit", title: "Hours limit"},
        {data: "status", title: "Status"},
        {data: "workerId", title: "Worker",
            tmpl: Meteor.isClient && Template.teamLead,
            tmplContext(rowData) {
                return {
                    userId: "workerId",
                    data: rowData
                };
            }
        },
        {data: "employerId", title: "Employer",
            tmpl: Meteor.isClient && Template.teamLead,
            tmplContext(rowData) {
                return {
                    userId: "employerId",
                    data: rowData
                };
            }
        },

        {data: "createdAt", title: "Created",
            render: function (val, type, doc) {
                return moment(val).format('L');
            }
        }

        // {
        //     tmpl: Meteor.isClient && Template.teamActions
        // }
    ]
});

TabularTables.Leads = new Tabular.Table({
    name: 'Leads',
    responsive: true,
    "dom": '<"top"f>rt<"bottom"pil><"clear">',
    "oLanguage": {
        "sInfo": "_START_-_END_ of _TOTAL_",
        "sLengthMenu": '<span>Rows per page:</span><select class="browser-default">' +
        '<option value="10">10</option>' +
        '<option value="20">20</option>' +
        '<option value="30">30</option>' +
        '<option value="40">40</option>' +
        '<option value="50">50</option>' +
        // '<option value="-1">All</option>' +
        '</select></div>'
    },
    scrollX: true,
    initComplete: function(settings, json) {
        var header = settings.aoHeader[0];
        var $firstTh = header[0].cell;
        var $firstThCheckbox = $('<input type="checkbox" class="filled-in" id="select-all" name="select_all"/><label for="select-all"></label>');
        $($firstTh).append($firstThCheckbox);
        header.shift();
        _.each(header, function (element, index, list) {
            var $sortSpan = $('<span class="sort"><a href="#"><i class="material-icons">keyboard_arrow_up</i></a>'+
                '<a href="#"><i class="material-icons">keyboard_arrow_down</i></a>'+
                '</span>');
            $(element.cell).append($sortSpan);
        });
    },
    'columnDefs': [{
        'targets': 0,
        'searchable': false,
        'orderable': false,
        // 'width': '1%',
        // 'className': 'dt-body-center',
        'render': function (data, type, full, meta){
            return '<input type="checkbox" ' + ' class='+'"filled-in"'+ ' id='+'"'+full._id+'"'+'/'+'>' +'<label for='+'"'+full._id+'"'+'></label>';
        }
    }],
    processing: false,
    collection: Leads,
    columns: [
        {
            tmpl: Meteor.isClient && Template.datatableCheckBox
        },
        {data: "vat", title: "VAT"},
        {data: "country", title: "Country"},
        {data: "puCreated", title: "PU"},
        {data: "name", title: "Name"},
        {data: "mobileNumber", title: "Mobile"},
        {data: "relatedKeyContact", title: "Related contact"},
        {data: "email", title: "Email"},
        {data: "account", title: "Account"},
        {data: "billingStreet", title: "Billing Street"},
        {data: "billingPostalCode", title: "Billing Postal Code"},
        {data: "billingCity", title: "Billing City"},
        {data: "numberOfEmployees", title: "Number of Employees"},
        {data: "navn", title: "Navn"},
        {data: "industry", title: "Industry"},
        {data: "decisionMaker", title: "Decision maker"},
        {data: "memberOf", title: "Member of"},
        {data: "opportunityType", title: "Opportunity Type"},
        {data: "customerType", title: "Customer Type"},
        {data: "status", title: "Status"},
        {data: "assignedUserName", title: "Assigned User name"},
        {data: "teams", title: "Teams"},
        {data: "salesStage", title: "Sales Stage"}

    ]
});

TabularTables.Jobs = new Tabular.Table({
    name: 'Jobs',
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
    collection: Jobs,
    scrollX: true,
    initComplete: function(settings, json) {
        var header = settings.aoHeader[0];
        var $firstTh = header[0].cell;
        var $firstThCheckbox = $('<input type="checkbox" class="filled-in" id="select-all" name="select_all"/><label for="select-all"></label>');
        $($firstTh).append($firstThCheckbox);
        header.shift();
        header.pop();
        _.each(header, function (element, index, list) {
            var $sortSpan = $('<span class="sort"><a href="#"><i class="material-icons">keyboard_arrow_up</i></a>'+
                '<a href="#"><i class="material-icons">keyboard_arrow_down</i></a>'+
                '</span>');
            $(element.cell).append($sortSpan);
        });

    },
    'columnDefs': [{
        'targets': 0,
        'searchable': false,
        'orderable': false,
        // 'width': '1%',
        // 'className': 'dt-body-center',
        'render': function (data, type, full, meta){
            return '<input type="checkbox" ' + ' class='+'"filled-in"'+ ' id='+'"'+full._id+'"'+'/'+'>' +'<label for='+'"'+full._id+'"'+'></label>';
        }
    }],
    extraFields: ['categoryId'],
    columns: [
        {
            tmpl: Meteor.isClient && Template.datatableCheckBox
        },
        {data: "title", title: "Title"},
        {data: "location", title: "Location",
            render: function (val, type, doc) {
                return val.city + ', ' + val.countryCode;
            }},
        {data: "categoryId", title: "Category",
            render: function (val, type, doc) {
                var category = JobCategories.findOne({_id: val});
                return category && category.label;
            }
        },
        {
            data: "skillsIds", title: "Skills",
            render: function (val, type, doc) {
                var skills = Skills.find({_id: {$in: val}}).fetch();
                skills = _.map(skills, function (skill) {
                    return skill.label;
                });
                return skills.join().replace(/,/gi, ', ');
            }
        },
        {
            data: "companyName", title: "Company"
        },
        {data: "ownerId", title: "Owner",
            tmpl: Meteor.isClient && Template.companyOwner
        },
        {
            data: "createdAt", title: "Created",
            render: function (val, type, doc) {
                return moment(val).format('L LT');
            }
        },
        {
            tmpl: Meteor.isClient && Template.jobsActions,
            tmplContext(rowData) {
                return {
                    isArchived: false,
                    data: rowData
                };
            }
        }
    ]
});

TabularTables.ArchivedJobs = new Tabular.Table({
    name: 'ArchivedJobs',
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
    collection: Jobs,
    scrollX: true,
    initComplete: function(settings, json) {
        var header = settings.aoHeader[0];
        var $firstTh = header[0].cell;
        var $firstThCheckbox = $('<input type="checkbox" class="filled-in" id="select-all" name="select_all"/><label for="select-all"></label>');
        $($firstTh).append($firstThCheckbox);
        header.shift();
        header.pop();
        _.each(header, function (element, index, list) {
            var $sortSpan = $('<span class="sort"><a href="#"><i class="material-icons">keyboard_arrow_up</i></a>'+
                '<a href="#"><i class="material-icons">keyboard_arrow_down</i></a>'+
                '</span>');
            $(element.cell).append($sortSpan);
        });

    },
    'columnDefs': [{
        'targets': 0,
        'searchable': false,
        'orderable': false,
        // 'width': '1%',
        // 'className': 'dt-body-center',
        'render': function (data, type, full, meta){
            return '<input type="checkbox" ' + ' class='+'"filled-in"'+ ' id='+'"'+full._id+'"'+'/'+'>' +'<label for='+'"'+full._id+'"'+'></label>';
        }
    }],
    columns: [
        {
            tmpl: Meteor.isClient && Template.datatableCheckBox
        },
        {data: "title", title: "Title"},
        {data: "location", title: "Location",
            render: function (val, type, doc) {
                return val.city + ', ' + val.countryCode;
            }},
        {data: "categoryId", title: "Category",
            render: function (val, type, doc) {
                var category = JobCategories.findOne({_id: val});
                return category && category.label;
            }
        },
        {
            data: "skillsIds", title: "Skills",
            render: function (val, type, doc) {
                var skills = Skills.find({_id: {$in: val}}).fetch();
                skills = _.map(skills, function (skill) {
                    return skill.label;
                });
                return skills.join().replace(/,/gi, ', ');
            }
        },
        {
            data: "companyName", title: "Company"
        },
        {data: "ownerId", title: "Owner",
            tmpl: Meteor.isClient && Template.companyOwner
        },
        {
            data: "createdAt", title: "Created",
            render: function (val, type, doc) {
                return moment(val).format('L LT');
            }
        },
        {
            tmpl: Meteor.isClient && Template.jobsActions,
            tmplContext(rowData) {
                return {
                    isArchived: true,
                    data: rowData
                };
            }
        }
    ]
});

Meteor.isClient && Template.registerHelper('TabularTables', TabularTables);