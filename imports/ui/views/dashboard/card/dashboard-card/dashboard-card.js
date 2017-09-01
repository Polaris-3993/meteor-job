import { Contracts } from '/imports/api/contracts/contracts';
import './dashboard-card.html';

Template.dashboardCard.onCreated(function () {
    var self = this;
    this.query = new ReactiveVar({status: {$nin: ['Closed']}, membersIds: Meteor.userId()});
    this.autorun(function () {
        Template.currentData();
        var companyId = Session.get('companyId');
        self.subscribe('ownerContracts', true, companyId);
    });
});

Template.dashboardCard.onRendered(function () {
    this.$('.dropdown-button').dropdown();
});

Template.dashboardCard.helpers({
    query: function () {
        var query = Template.instance().query.get();
        return query;
    },
    contractedUsers: function () {
        var contracts = Contracts.find({employerId: Meteor.userId()}).fetch();
        var workersIds = _.map(contracts, function (contract) {
            return contract.workerId;
        });
        var contractedUsers = Meteor.users.find({_id: {$in: workersIds}}).fetch();
        return contractedUsers;
    },
    showUsers: function () {
        var tmpl = Template.instance();
        var content = tmpl.data.content;
        return content == 'dashboardTasksList';
    }
});

Template.dashboardCard.events({
    'change input[type=radio]': function (event, tmpl) {
        event.preventDefault();
        var name = event.target.className;
        var content = tmpl.data.content;
        if(content == 'dashboardTasksList'){
            if (name == 'assigned-to-me') {
                tmpl.query.set({status: {$nin: ['Closed']}, membersIds: Meteor.userId()});
            }
            else {
                tmpl.query.set({status: {$nin: ['Closed']}, $or: [{membersIds: name}, {ownerId: name}]});
            }
        }
    },
    'click .dropdown-content': function (event, tmpl) {
        event.stopPropagation();
    }
});