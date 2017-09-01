import { VZ } from '/imports/startup/both/namespace';
/**
 * Created by yukinohito on 3/25/17.
 */
import { Meteor } from 'meteor/meteor'; 
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Tasks } from '/imports/api/tasks/tasks';

import './project-item-more.html';

Template.projectListItemMore.onCreated(function() {
  this.autorun(() => {
    this.subscribe('timeEntriesAdminOrUser', this.data.project._id);
  });
  this.isBoss = VZ.canUser('viewTimeEntriesRelatedToProject', Meteor.userId(), this.data.project._id);
  this.currentMode = new ReactiveVar(this.isBoss === true ? 'Cost' : 'Hours');
  this.checkProjectInfo = () => {
    const info = this.data.project.info;
    return info !== undefined && 
           info.tasksCount !== undefined &&
           info.tasksCompleted !== undefined &&
           info.totalContractedTime !== undefined &&
           info.totalEarned !== undefined &&
           info.totalTrackedTime !== undefined;
  };
  this.contracted = function(timeEntries) {
    return timeEntries.filter(timeEntry => {
      return typeof timeEntry.contractId === 'string' && timeEntry.contractId.length > 0;
    });
  };
  function addZero(number) {
    if(number < 10) {
      return '0' + number;
    } else {
      return number;
    }
  }
  const oneSecond = 1000;
  const oneMinute = oneSecond * 60;
  const oneHour = oneMinute * 60;
  this.formatTime = function(time) {
    const hours = Math.floor(time / oneHour);
    const minutes = Math.floor((time - hours * oneHour) / oneMinute);
    const seconds = Math.floor((time - hours * oneHour - minutes * oneMinute) / oneSecond);
    return `${addZero(hours)}:${addZero(minutes)}:${addZero(seconds)}`;
  };
  this.tracked = function(timeEntries, isNumber) {
    const timeTracked = timeEntries.reduce((sum, timeEntry) => {
      return sum += timeEntry.endDate - timeEntry.startDate;
    }, 0);
    if(isNumber === 'number') {
      return timeTracked;
    }
    return this.formatTime(timeTracked);
  };
  this.earned = function(timeEntries, rate) {
    return rate * timeEntries.reduce((sum, timeEntry) => {
        return sum += timeEntry.endDate - timeEntry.startDate;
      }, 0) / oneHour;
  };
});

Template.projectListItemMore.helpers({
  userIsBoss() {
    return Template.instance().isBoss;
  },
  getCurrentMode() {
    return Template.instance().currentMode.get();
  },
  resultThisWeek() {
    const template = Template.instance();
    const mode = template.currentMode.get();
    const project = template.data.project;
    if(template.checkProjectInfo() === true) {
      const rate = project.info.paymentType === 'hourly' ? project.info.paymentRate : 0;
      const startOfThisWeek = moment().startOf(VZ.dateRanges['Weekly']);
      const timeEntries = template.contracted(TimeEntries.find({
        projectId: project._id,
        startDate: {
          $gt: startOfThisWeek.toDate()
        },
      }).fetch());
      let result;
      if(mode === 'Cost') {
        result = `$ ${template.earned(timeEntries, rate).toFixed(0)}`;
      } else if(mode === 'Hours') {
        result = template.tracked(timeEntries);
      } else {
        throw new Meteor.Error(`Unknown mode ${mode}`);
      }
      return result;
    } else {
      if(mode === 'Cost') {
        return `$ ${template.earned([], 0).toFixed(0)}`;
      } else if(mode === 'Hours') {
        return template.tracked([]);
      } else {
        throw new Meteor.Error(`Unknown mode ${mode}`);
      }
    }
  },
  modeVerb() {
    const mode = Template.instance().currentMode.get();
    if(mode === 'Cost') {
      return 'spent';
    } else if(mode === 'Hours') {
      return 'tracked';
    } else {
      throw new Meteor.Error(`Unknown mode ${mode}`);
    }
  },
  bestResultsLabel() {
    const mode = Template.instance().currentMode.get();
    if(mode === 'Cost') {
      return 'Hottest expenses';
    } else if(mode === 'Hours') {
      return "Stakhanov's tracks";
    } else {
      throw new Meteor.Error(`Unknown mode ${mode}`);
    }
  },
  compareToLastWeek() {
    const template = Template.instance();
    const mode = template.currentMode.get();
    const project = template.data.project;
    if(template.checkProjectInfo() === true) {
      const rate = project.info.paymentType === 'hourly' ? project.info.paymentRate : 0;
      const startOfThisWeek = moment().startOf(VZ.dateRanges['Weekly']);
      const startOfLastWeek = startOfThisWeek.clone().subtract(1, 'weeks');
      const timeEntriesLastWeek = template.contracted(TimeEntries.find({
        projectId: project._id,
        startDate: {
          $gt: startOfLastWeek.toDate(),
          $lt: startOfThisWeek.toDate()
        }
      }).fetch());
      const timeEntriesThisWeek = template.contracted(TimeEntries.find({
        projectId: project._id,
        startDate: {
          $gt: startOfThisWeek.toDate()
        },
        _done: true
      }).fetch());
      let resultLastWeek, resultThisWeek;
      if(mode === 'Cost') {
        resultLastWeek = template.earned(timeEntriesLastWeek, rate);
        resultThisWeek = template.earned(timeEntriesThisWeek, rate);
      } else if(mode === 'Hours') {
        resultLastWeek = template.tracked(timeEntriesLastWeek, 'number');
        resultThisWeek = template.tracked(timeEntriesThisWeek, 'number');
      } else {
        throw new Meteor.Error(`Unknown mode ${mode}`);
      }
      if(resultLastWeek < resultThisWeek) {
        return `${Math.round(resultThisWeek * 100 / resultLastWeek - 100)}% more vs last week`;
      } else if(resultLastWeek > resultThisWeek) {
        return `${Math.round(100 - resultThisWeek * 100 / resultLastWeek)}% less vs last week`;
      } else if(resultLastWeek === resultThisWeek) {
        return `Same amount as last week`;
      }
    } else {
      return `Info not available`;
    }
  },
  increment(index) {
    return ++index;
  },
  hottestResults() {
    const oneHour = 1000 * 60 * 60;
    const template = Template.instance();
    const mode = template.currentMode.get();
    const project = template.data.project;
    if(template.checkProjectInfo() === true) {
      let tasksIds = [];
      let result = [];
      const rate = project.info.paymentType === 'hourly' ? project.info.paymentRate : 0;
      const startOfThisWeek = moment().startOf(VZ.dateRanges['Weekly']);
      const timeEntries = template.contracted(TimeEntries.find({
        projectId: project._id,
        startDate: {
          $gt: startOfThisWeek.toDate()
        }
      }).fetch());
      timeEntries.forEach(timeEntry => {
        if(timeEntry.taskId) {
          let index = result.findIndex(item => item.taskId === timeEntry.taskId);
          if(index === -1) {
            index = result.length;
            result.push({
              taskId: timeEntry.taskId,
              timeCount: 0,
              totalEarned: 0
            });
            tasksIds.push(timeEntry.taskId);
          }
          result[index].timeCount += timeEntry.endDate - timeEntry.startDate;
        }
      });
      result.forEach(item => {
        item.totalEarned = rate * item.timeCount / oneHour;
      });
      let tasks = Tasks.find({_id: {$in: tasksIds}}).fetch();
      tasks = tasks.map(task => {
        const infoItem = result.find(item => item.taskId === task._id);
        task.timeCount = infoItem.timeCount;
        task.totalEarned = infoItem.totalEarned;
        return task;
      });
      if(mode === 'Cost') {
        return tasks.sort((a, b) => b.totalEarned - a.totalEarned).slice(0, 3);
      } else if(mode === 'Hours') {
        return tasks.sort((a, b) => b.timeCount - a.timeCount).slice(0, 3);
      } else {
        throw new Meteor.Error(`Unknown mode ${mode}`);
      }
    } else {
      return [];
    }
  },
  taskResult(task) {
    const template = Template.instance();
    const mode = template.currentMode.get();
    if(mode === 'Cost') {
      return task.totalEarned.toFixed(2);
    } else if(mode === 'Hours') {
      return template.formatTime(task.timeCount);
    } else {
      throw new Meteor.Error(`Unknown mode ${mode}`);
    }
  },
  projectOpenURL() {
    return `/project/${Template.instance().data.project._id}/dashboard`
  },
  isArchived() {
    return Template.instance().data.project.archived;
  }
});

Template.projectListItemMore.events({
  'click .dropdown-content>li': function(event, template) {
    template.currentMode.set(event.target.innerText);
  },
  'click .archive': function(event, template) {
    const project = template.data.project;
    if(project.archived === false) {
      Meteor.call('archiveProject', project._id, function (err) {
        if (err) {
          VZ.notify(err);
        } else {
          VZ.notify("Successfully archived!");
        }
      });
    } else {
      Meteor.call('restoreProjects', [project._id], function (error, result) {
        if(!error){
          VZ.notify('Restored');
        }
        else {
          VZ.notify(error.message);
        }
      });
    }
  }
});
