import './contract-view.html';

import { ContractsStatusChanges } from '/imports/api/contractsStatusChanges/contractsStatusChanges';
import { Companies } from '/imports/api/companies/companies';

Template.contractView.onCreated(function () {

});

Template.contractView.onRendered(function () {

});

Template.contractView.helpers({
    relatedCompanyName: function () {
        var companyId = this.contract.companyId;
        if (companyId) {
            var company = Companies.findOne(companyId);
            return company ? company.name : 'Something Inc.';
        } else {
            return 'Something Inc.';
        }
    },

    rateType: function () {
        return 'hour';
    },

    statuses: function () {
        var contractId = this.contract._id;
        return ContractsStatusChanges.find({contractId: contractId}, {sort: {changedAt: 1}})
            .fetch().map(function (status, index, array) {
                var statusObj = {
                    name: status.status,
                    startDate: moment(status.changedAt).format('MMMM DD, YYYY')
                };

                statusObj.endDate = index < array.length - 1 ?
                    moment(array[index + 1].changedAt).format('MMMM DD, YYYY') : 'Today';

                return statusObj;
            });
    },

    employerName: function () {
        var user = Meteor.users.findOne(this.contract.employerId);
        return user ? user.profile.fullName : 'Someone';
    },

    workerName: function () {
        var user = Meteor.users.findOne(this.contract.workerId);
        return user ? user.profile.fullName : 'Someone';
    },

    shouldShowEmployerInfo: function () {
        return this.contract.employerId != Meteor.userId();
    },

    shouldShowWorkerInfo: function () {
        return this.contract.workerId != Meteor.userId();
    },

    canAcceptOrDecline: function () {
        return this.contract.status == 'pending' && this.contract.workerId == Meteor.userId();
    },
    canPauseOrEnd: function () {
        return this.contract.status == 'active';// || this.contract.status == 'paused';
    },
    canContinue: function () {
        return this.contract.status == 'paused';
    }
});

Template.contractView.events({
    'click #acceptContract': function (event, tmpl) {
        Meteor.call('acceptContract', tmpl.data.contract._id, function (err, res) {
            console.log(err ? err : res);
        });
    },

    'click #declineContract': function (event, tmpl) {
        Meteor.call('declineContract', tmpl.data.contract._id, function (err, res) {
            console.log(err ? err : res);
        });
    },

    'click #pauseContract': function (event, tmpl) {
        Meteor.call('pauseContract', tmpl.data.contract._id, function (err, res) {
            console.log(err ? err : res);
        });
    },

    'click #endContract': function (event, tmpl) {
        Meteor.call('endContract', tmpl.data.contract._id, function (err, res) {
            console.log(err ? err : res);
        });
    },

    'click #continueContract': function (event, tmpl) {
        Meteor.call('continueContract', tmpl.data.contract._id, function (err, res) {
            console.log(err ? err : res);
        });
    }
});