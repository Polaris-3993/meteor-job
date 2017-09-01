import { VZ } from '/imports/startup/both/namespace';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Contracts } from '/imports/api/contracts/contracts';

import './activity-list.html';
import { timeEntriesSubs } from '/imports/startup/client/subManagers';

Template.dashboardWorkerActivityList.onCreated(function () {
  var self = this;
    this.workersIds = new ReactiveVar([]);
    self.ready = new ReactiveVar(false);
    const dateRange = {
        date: moment().toDate(),
        range: 'Weekly'
    };

    this.autorun(() => {
        let companyId = Session.get('companyId');
        if (this.workersIds.get()) {
          var sub = timeEntriesSubs.subscribe('userRangeWorkTimeCard', dateRange, this.workersIds.get(), companyId);
          if(sub.ready()){
            self.ready.set(true);
          }
        }
    });

    this.prepareWeekTimeArray = function(startOfThisWeek) {
      const copyStartOfThisWeek = startOfThisWeek.clone();
      const dateFormat = "YYYY-MM-DD";
      let result = [];
      result[0] = {
        date: copyStartOfThisWeek.format(dateFormat),
        timeCount: 0
      };
      for(let x = 1, count = 7; x < count; x++) {
        result[x] = {
          date: copyStartOfThisWeek.add(1, "day").format(dateFormat),
          timeCount: 0
        }
      }
      return result;
    }
});
Template.dashboardWorkerActivityList.helpers({
    /**
    * This function makes following calculations:
    * 1. Get contracts and timeEntries of other users,
    * timeEntries taken for current week only
    * 2. Calculate amount of time each user tracked
    * doing tasks in contracted projects each day of week
    * 3. Calculate total week time count for each user
    * and total earned amount of money from all contracts
    *
    * Result array elements have followring structure: {
    *     workerId,
    *     weekTimeCount: [],
    *     totalEarned: 25
    * },
    * where weekTimeCount[n] = {
    *     date: "YYYY-MM-DD",
    *     timeCount: 1342798
    * }, timeCount in milliseconds
    * Be advised that totalEarned counts with different rates
    * from different contracts.
    **/
    workersItems: function() {
      let workers = [];
      let workersIds = [];
      const dateFormat = "YYYY-MM-DD";
      const oneHour = 1000 * 60 * 60;
      const contracts = Contracts.find({
        workerId: {
          $ne: Meteor.userId()
        },
        employerId: Meteor.userId()
      }).fetch();
      const startOfThisWeek = moment().startOf(VZ.dateRanges['Weekly']);
      const startOfNextWeek = startOfThisWeek.clone().add(1, 'weeks');
      //console.log("startOfThisWeek", startOfThisWeek.format(dateFormat));
      //console.log("startOfNextWeek", startOfNextWeek.format(dateFormat));
      const timeEntries = TimeEntries.find({
        userId: {
          $ne: Meteor.userId()
        },
        startDate: {
          $gt: startOfThisWeek.toDate()
        },
        _done: true
      },{
        $sort: {
          startDate: -1
        }
      }).fetch();
      // next line allows helper to rerun
      TimeEntries.find().count();
      //console.log(timeEntries.length, TimeEntries.find().count());
      //console.log("contracts", contracts);
      //console.log("timeEntries", timeEntries);

      // prepare variables for data
      let contractedUsersIds = [];
      contracts.forEach(contract => {
        let wIndex = contractedUsersIds.findIndex(item => item.workerId === contract.workerId);
        if(wIndex ===  -1) {
          wIndex = contractedUsersIds.length;
          contractedUsersIds.push({
            workerId: contract.workerId,
            contracts: []
          });
          workersIds.push(contract.workerId);
          workers.push({
            workerId: contract.workerId,
            weekTimeCount: Template.instance().prepareWeekTimeArray(startOfThisWeek),
            totalEarned: 0
          });
        }
        const enhancedContract = Object.assign({}, contract, {
          contractedTime: 0
        });
        contractedUsersIds[wIndex].contracts.push(enhancedContract);
      });

      // count time for each user each contract each day of the week
      // console.log("contractedUsersIds", contractedUsersIds);
      timeEntries.forEach(timeEntry => { 
        for(let x = 0, count = contractedUsersIds.length; x < count; x++) {
          const userId = contractedUsersIds[x].workerId;
          const contracts = contractedUsersIds[x].contracts;
          contracts.forEach(contract => {
            //console.log("time entry and contract", userId, contract.contractedTime, contract, timeEntry);
            if(timeEntry.contractId === contract._id && userId === timeEntry.userId) {
              const duration = timeEntry.endDate - timeEntry.startDate;
              contract.contractedTime += duration;
              const wIndex = workers.findIndex(worker => worker.workerId === userId);
              const formattedStartDate = moment(timeEntry.startDate).format(dateFormat);
              const dIndex = workers[wIndex].weekTimeCount.findIndex(item => item.date === formattedStartDate);
              workers[wIndex].weekTimeCount[dIndex].timeCount += duration;
            }
          });
        }
      });

      // count money earned for each user in every contract
      contractedUsersIds.forEach(userData => {
        //console.log("wIndex", workers, userData.workerId, workerIndex(workers, userData.workerId));
        const wIndex = workers.findIndex(worker => worker.workerId === userData.workerId);
        userData.contracts.forEach(contract => {
          if(contract.paymentInfo && contract.paymentInfo.type === 'hourly') {
            //console.log("count money", contract.contractedTime);
            workers[wIndex].totalEarned += contract.contractedTime * contract.paymentInfo.rate / oneHour;
          }
        });
      });

      // return results
      /*workers.forEach(workerData => {
        workerData.weekTimeCount.forEach(dayCount => {
          console.log(dayCount.date, (dayCount.timeCount / oneHour).toFixed(2));
        });
        console.log(workerData.workerId, "earned $", workerData.totalEarned.toFixed(2));
      });*/
      Template.instance().workersIds.set(workersIds);
      //console.log("workers", workers);
      return workers;
    },
    emptyCardMessage () {
        return 'Nothing to show in activity';
    },
    dataLoadingMessage() {
        return 'Loading...';
    },
    ready() {
        return Template.instance().ready.get();
    }
});
