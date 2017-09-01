/**
 * Created by yukinohito on 3/25/17.
 */
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';

import './project-item-new.html';

Template.projectListItem.onCreated(function() {
  this.checkProjectInfo = () => {
    const info = this.data.info;
    return info !== undefined &&
           info.tasksCount !== undefined &&
           info.tasksCompleted !== undefined &&
           info.totalContractedTime !== undefined &&
           info.totalEarned !== undefined &&
           info.totalTrackedTime !== undefined;
  }
});

Template.projectListItem.helpers({
  workersCount() {
    const project = Template.instance().data;
    const assignedUsersIds = project.assignedUsersIds || [];
    const users = Meteor.users.find({
      _id: {
        $in: assignedUsersIds
      }
    }).fetch();
    const workersCount = users.reduce((sum, user) => {
      if(user.roles[project._id].indexOf('project-worker') !== -1) {
        return ++sum;
      } else {
        return sum;
      }
    }, 0);
    if(workersCount === 1) {
      return `${workersCount} worker`;
    } else {
      return `${workersCount} workers`;
    }
  },
  getLastUpdatedAt() {
    const oneMinute = 1000 * 60;
    const lastUpdatedAt = moment(Template.instance().data.updatedAt);
    let fromNow = lastUpdatedAt.fromNow();
    if(moment().diff(lastUpdatedAt) < oneMinute) {
      fromNow = 'moments ago';
    }
    return `${fromNow} ${lastUpdatedAt.format('HH:mm')}`;
  },
  getTimeTracked() {
    const template = Template.instance();
    if(template.checkProjectInfo() === true) {
      return template.data.info.totalTrackedTime / 1000;
    } else {
      return 0;
    }
  },
  getTasksDone() {
    const data = Template.instance().data;
    if(data.info && data.info.tasksCount) {
      const tasksDoneCount = data.info.tasksCompleted || 0;
      const tasksCount = data.info.tasksCount;
      //console.log("data.info", data.info);
      return `${tasksDoneCount} / ${tasksCount}`;
    } else {
      return `0 / 0`;
    }
  },
  getMoneyEarned() {
    const template = Template.instance();
    if(template.checkProjectInfo() === true) {
      return template.data.info.totalEarned.toFixed(0);
    } else {
      return 0;
    }
  }
});

Template.projectListItem.events({
  'click .title-info>h5': function(event, template) {
    Router.go(`/project/${template.data._id}/dashboard`);
  }
});
