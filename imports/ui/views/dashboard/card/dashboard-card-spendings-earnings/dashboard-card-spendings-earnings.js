import './dashboard-card-spendings-earnings.html';

Template.dashboardCardSpendingsEarnings.onCreated(function () {
    var self = this;
    this.query = new ReactiveVar({});
    this.autorun(function () {
        var data = Template.currentData();
        var title = data && data.title;
        self.query.set({title: title});
    });
});

Template.dashboardCardSpendingsEarnings.onRendered(function () {
    this.$('.dropdown-button').dropdown();
});

Template.dashboardCardSpendingsEarnings.helpers({
    query: function () {
        var query = Template.instance().query.get();
        return query;
    }
});

Template.dashboardCardSpendingsEarnings.events({
});
