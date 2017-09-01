import './activity-item.html';

Template.dashboardWorkerActivityItem.helpers({
  workerAvatar: function () {
      const workerId = this.workerId;
      const worker = Meteor.users.findOne(workerId);
      if (!worker || !worker.profile) {
          return;
      }
      if (!worker.profile.photo || !worker.profile.photo.large) {
          return '/images/default-lockout.png'
      }

      return worker.profile.photo.large;
  },
  workerName() {
    const workerId = this.workerId;
    const worker = Meteor.users.findOne(workerId);
    if(worker && worker.profile) {
      return worker.profile.fullName;
    }
  },
  workerStatus() {
    const workerId = this.workerId;
    const worker = Meteor.users.findOne(workerId);
    if(worker && worker.profile) {
      return worker.profile.online;
    }
  },
  totalTime() {
    const weekTimeCount = this.weekTimeCount;
    let result = 0;
    for(let x = 0, count = weekTimeCount.length; x < count; x++) {
      result += weekTimeCount[x].timeCount;
    }
    return result / 1000;
  },
  totalMoneyEarned() {
    return this.totalEarned && this.totalEarned.toFixed(2) || 0;
  }
});
