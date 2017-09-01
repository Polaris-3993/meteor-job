import { Contracts } from '/imports/api/contracts/contracts';
import './dashboard-in-review-tasks.html';

Template.dashboardCardInReviewTasks.onCreated(function () {
    var self = this;
    this.query = new ReactiveVar('name');
    this.autorun(function () {

    });
});

Template.dashboardCardInReviewTasks.onRendered(function () {
    this.$('.dropdown-button').dropdown();
});

Template.dashboardCardInReviewTasks.helpers({
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
        console.log(contractedUsers);
        return contractedUsers;
    },
    showUsers: function () {
        var tmpl = Template.instance();
        var content = tmpl.data.content;
        return content == 'usersInReviewTasks';
    }
});

Template.dashboardCardInReviewTasks.events({
    'change input[type=radio]': function (event, tmpl) {
        event.preventDefault();
        var name = event.target.className;
        var content = tmpl.data.content;
        if (content == 'usersInReviewTasks') {
            tmpl.query.set(name);
        }
    },
    'click .dropdown-content': function (event, tmpl) {
        event.stopPropagation();
    }
});
