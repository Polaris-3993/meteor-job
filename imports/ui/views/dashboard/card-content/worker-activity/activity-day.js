import './activity-day.html';

Template.dashboardWorkerActivityDay.helpers({
  timeCountSeconds() {
    return this.timeCount / 1000;
  }
});
