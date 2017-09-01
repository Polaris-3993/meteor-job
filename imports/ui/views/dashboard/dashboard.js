import './dashboard.html';
import './card/card';
import './card-content/card-content';
import './my-dashboard/my-dashboard';
import './workers-dashboard/workers-dashboard';

Template.dashboard.onCreated(function () {
});

Template.dashboard.onRendered(function () {
    this.$('ul.tabs').tabs();
});

Template.dashboard.helpers({
    tab: function () {
        var userRole = Session.get('user-role');
        return userRole === 'user' ? 'myDashboard' : userRole === 'company' ? 'workersDashboard' : false;
    }
});

Template.dashboard.events({

});