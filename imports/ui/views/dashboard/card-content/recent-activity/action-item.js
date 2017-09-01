import './activity-list.html';
Template.dashboardAction.helpers({
    getTime: function () {
      return moment(this.createdAt).format('hh:mm a');
    }
});
