import { VZ } from '/imports/startup/both/namespace';
import './create-edit-contract.html';
import { Projects } from '/imports/api/projects/projects';
import { Companies } from '/imports/api/companies/companies';

Template.createEditContract.onCreated(function () {
    var workerId = this.data.contract ? this.data.contract.workerId : '';
    this.selectedWorkerId = new ReactiveVar(workerId);

    var companyId = this.data.contract ? this.data.contract.companyId : '';
    this.selectedCompanyId = new ReactiveVar(companyId);

    const projectIds = this.data.contract ? this.data.contract.projectIds : [];
    this.selectedProjectIds = new ReactiveVar(projectIds);

    const projectsWhereUserIsWorker = Roles.getGroupsForUser(workerId, 'project-worker');
    const isWorkerArray = _.intersection(projectIds, projectsWhereUserIsWorker);

    let isWorker;
    if(this.data.contract){
        isWorker = isWorkerArray.length > 0 ? 'project-worker' : 'project-viewer';
    }
    else {
        isWorker = 'project-worker';
    }
    this.workerRole = new ReactiveVar(isWorker);

    var self = this;
    this.autorun(function () {
        self.subscribe('user', self.selectedWorkerId.get());
    });
    this.autorun(function () {
        self.subscribe('Companies', {_id: self.selectedCompanyId.get()});
    });
    this.autorun(function () {
        self.subscribe('Projects', false);
    });
});

Template.createEditContract.onRendered(function () {
    var self = this;
    this.autorun(function () {
        self.workerRole.get();
        setTimeout(function () {
            $('#paymentInfoTypeSelect').material_select();
        },50);
    });
});

Template.createEditContract.onDestroyed(function () {
    // this.$('#paymentInfoTypeSelect').material_select('destroy');
});

Template.createEditContract.helpers({
    paymentTypes: [{
        value: 'hourly',
        label: 'Hourly Rate'
    }, {
        value: 'monthly',
        label: 'Monthly Rate'
    }, {
        value: 'fixed',
        label: 'Fixed'
    }],

    canBeSubmitted: function () {
        return true;
    },

    excludedUsersIds: function () {
        return [];
    },
    onWorkerSelectedCb: function () {
        var tmpl = Template.instance();
        return function (workerId) {
            tmpl.selectedWorkerId.set(workerId);
        }
    },
    selectedWorker: function () {
        var workerId = Template.instance().selectedWorkerId.get();
        return Meteor.users.findOne(workerId);
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
    },

    availableProjectsIds: function () {
        // var projectsWhereUserIsWorker = Roles.getGroupsForUser(Meteor.userId(), 'project-worker'); // may be need changed later
        var projectsWhereUserIsManager = Roles.getGroupsForUser(Meteor.userId(), 'project-manager');
        var projectsWhereUserIsAdmin = Roles.getGroupsForUser(Meteor.userId(), 'project-admin');
        return _.union(projectsWhereUserIsManager, projectsWhereUserIsAdmin);
    },
    onProjectSelectCb: function () {
        var tmpl = Template.instance();
        return function (projectId) {
            let projects = tmpl.selectedProjectIds.get(projectId);
            if(projects.indexOf(projectId) === -1) {
              projects.push(projectId);
            }
            tmpl.selectedProjectIds.set(projects);
        }
    },
    onProjectRemoveCb() {
      /*const template = Template.instance();
      return function(projectId) {
        if(projectId) {
          let projects = template.selectedProjectIds.get(projectId);
          projects = projects.filter(selectedProjectId => selectedProjectId !== projectId);
          template.selectedProjectIds.set(projects);
        }
      }*/
    },
    selectedProjects: function () {
        const projectIds = Template.instance().selectedProjectIds.get();
        return Projects.find({_id: {$in: projectIds}}).fetch();
    },
    isWorker: function () {
        var tmpl = Template.instance();
        var workerRole = tmpl.workerRole.get();
        return workerRole == 'project-worker';
    }
});

Template.createEditContract.events({
    'submit form': function (event, tmpl) {
        var getContractDocument = function () {
            var name = tmpl.$('#name').val();
            // var description = this.$('#description').val();
            var workerId = tmpl.selectedWorkerId.get();
            var weekHoursLimit = tmpl.$('#weekHoursLimit').val();
            var paymentType = tmpl.$('#paymentInfoTypeSelect').val();
            var rate = parseFloat(tmpl.$('#rate').val());
            var userRole = tmpl.$('[name="user-role"]:checked').val();

            var companyId = tmpl.selectedCompanyId.get();
            var projectIds = tmpl.selectedProjectIds.get();
            var isRole  = _.indexOf(['project-viewer', 'project-worker'], userRole);

            if(isRole == -1){
                VZ.notify('Wrong role');
                return;
            }
            var document = {
                name: name,
                userRole: userRole,
                // description: description,
                workerId: workerId,
                paymentInfo: {
                    type: paymentType,
                    rate: rate,
                    weekHoursLimit: weekHoursLimit
                }
            };

            if (companyId) {
                document.companyId = companyId;
            }
            if (projectIds.length > 0) {
                document.projectIds = projectIds;
            }

            return document;
        };

        event.preventDefault();
        var document = getContractDocument();
        // console.log(document);
        if(document.userRole == 'project-worker'){
            if(!document.paymentInfo.weekHoursLimit || !document.paymentInfo.type || !document.paymentInfo.rate) {
                VZ.notify('Set payment info');
                return;
            }
        }else {
            document = _.omit(document, 'paymentInfo');
        }
        if(tmpl.data && tmpl.data.contract){
            document._id = tmpl.data.contract._id;
            Meteor.call('editContract', document, function (err, res) {
                if (err) {
                    console.log(err);
                    VZ.notify(err.message);
                } else {
                    Router.go('contract', {id: res});
                }
            });
        }
        else {
            Meteor.call('createContract', document, function (err, res) {
                if (err) {
                    console.log(err);
                    VZ.notify(err.message);
                } else {
                    Router.go('contract', {id: res});
                }
            });
        }
    },

    'click #cancel-button': function (event, tmpl) {
        event.preventDefault();
        Router.go('home');
    },

    'input #workerName': function (event, tmpl) {
        event.preventDefault();
        event.target.value = '';
        tmpl.selectedWorkerId.set(null);
    },

    'input #companyName': function (event, tmpl) {
        event.preventDefault();
        event.target.value = '';
        tmpl.selectedCompanyId.set(null);
    },

    'input #projectName': function (event, tmpl) {
        event.preventDefault();
        event.target.value = '';
        tmpl.selectedProjectIds.set([]);
    },
    'change input[name="user-role"]': function (event, tmpl) {
        var userRole = event.currentTarget.value;
        tmpl.workerRole.set(userRole);
    }
});
