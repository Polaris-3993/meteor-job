import { TimeEntries } from './timeEntries';
import { Projects } from '/imports/api/projects/projects';
import { Contracts } from '/imports/api/contracts/contracts';
import { Screenshots } from '/imports/api/screenShots/screenShots';
import { EntryTags } from '/imports/api/entryTags/entryTags';
import { VZ } from '/imports/startup/both/namespace';

var Future =  Npm.require('fibers/future');

Meteor.methods({
    'startTracking': function (query) {
        var userId = this.userId;
        if (!userId) {
            throw new Meteor.Error('permission-error', 'Start tracking may only authorized user!');
        }
        const contract = Contracts.findOne({projectIds: query.projectId, workerId: userId});
        if(contract && contract.status === 'active') {
            query.contractId = contract._id;
            query.paymentType = contract.paymentInfo.type;
            query.paymentRate = contract.paymentInfo.rate;
        }
        return VZ.TimeTracker.methods.startTracking(query, userId);
    },

    'stopTracking': function (entryId, endDate) {
        var userId = this.userId;
        if (!userId) {
            throw new Meteor.Error('permission-error', 'Stop tracking may only authorized user!');
        }
        VZ.TimeTracker.methods.stopTracking(entryId, userId, endDate);
    },
    'clientStartTracking': function(data) {
        var userId = this.userId || data.userId;
        if(!userId) {
            throw new Meteor.Error('permission-error', 'Only authorized users can start time tracking');
        }
        const query = {
            clientAppId: data.clientAppId,
            projectId: data.projectId,
            taskId: data.taskId,
            contractId: data.contractId,
            paymentType: data.paymentType,
            paymentRate: data.paymentRate,
            message: data.message,
            _done: false,
            _active: true,
            _initiatedByDesktopApp: true,
            _trackedByDesktopApp: true,
            countKeyboardEvents: data.countKeyboardEvents,
            countMouseEvents: data.countMouseEvents,

        };
        var activeTimeEntryId =  VZ.TimeTracker.methods.startTracking(query, userId);
        return TimeEntries.findOne({_id: activeTimeEntryId});
    },
    'clientStopTracking' : function(data) {
        var userId = this.userId || data.userId;
        if(!userId) {
            throw new Meteor.Error('permission-error', 'Only authorized users can stop time tracking');
        }
        return VZ.TimeTracker.methods.stopTracking(data.entryId, userId);
    },
    // 'setCounterStartData': function(data) {
    //   VZ.TimeTracker.methods.setCounterStartData(data);
    // },
    // 'getCounterStartData': function(data) {
    //   const userId = this.userId || data.userId;
    //   if(!userId) {
    //     throw new Meteor.Error('permission-error','Only authorized users can retrieve counter start data');
    //   }
    //   const query = {
    //     _id: data.activeTimeEntryId,
    //     userId
    //   };
    //   VZ.TimeTracker.methods.getCounterStartData(query);
    // },
    'syncTimeEntries': function (timeEntries, clientUserId) {
        // sync array of entries
        var userId = clientUserId ? clientUserId : this.userId;
        return _.map(timeEntries, function (timeEntry) {
            if (timeEntry.userId != userId) {

                return {
                    timeEntryInfo: {
                        startDate: timeEntry.startDate,
                        projectId: timeEntry.projectId,
                        taskId: timeEntry.taskId,
                        message: timeEntry.message,
                        userId: userId, //timeEntry.projectId
                        countKeyboardEvents: timeEntry.countKeyboardEvents,
                        countMouseEvents: timeEntry.countMouseEvents,
                        countEventsPerMin: timeEntry.countEventsPerMin

                    },
                    error: 'permission-error'
                }
            } else {
                var id = VZ.TimeTracker.methods.syncTimeEntry(timeEntry);

                if (id) {
                    return {
                        timeEntryInfo: {
                            _id: id,
                            startDate: timeEntry.startDate,
                            projectId: timeEntry.projectId,
                            taskId: timeEntry.taskId,
                            message: timeEntry.message,
                            userId: userId,//timeEntry.projectId
                            countKeyboardEvents: timeEntry.countKeyboardEvents,
                            countMouseEvents: timeEntry.countMouseEvents,
                            countEventsPerMin: timeEntry.countEventsPerMin
                        }
                    }
                }
            }
        });
    },

    'syncTimeEntry': function (timeEntry) {
        if (timeEntry.userId != this.userId) {
            throw new Meteor.Error('permission-error', 'You should be authorized for this action!');
        }
        return VZ.TimeTracker.methods.syncTimeEntry(timeEntry);
    },

    'markTimeEntryAsTrackedByApp': function (timeEntryId) {
        var userId = this.userId;
        if (!userId) {
            throw new Meteor.Error('permission-error', 'You should be logged in to perform this action!');
        }
        return VZ.TimeTracker.methods.markTimeEntryAsTrackedByApp(timeEntryId, userId);
    },

    /**
     * Adding manual time
     * @param {object} params - object, with time params
     * @param {date} params.startDate - start date of adding time
     * @param {date} params.endDate - end date of adding time
     * @param {string} params.message - message(title) of adding time
     * @param {string} params.projectId - id of project, for which time is added
     */
    'addManualTime': function (params) {
        var userId = this.userId;
        if (!userId) {
            throw new Meteor.Error('permission-error', 'Add manual time may only authorized user');
        }
        VZ.TimeTracker.methods.addManualTime(params, userId);

    },

    /**
     * Upload taken screenshot to Google Storage
     * @param {object} screenshotParams - object, with screenshot params, and arraybuffer
     */
    'uploadTakenScreenshot': function (screenshotParams, clientUserId) {
        var userId = clientUserId || this.userId;
        console.log('uploadTakenScreenshot', userId);
        if (!userId) {
            throw new Meteor.Error('permission-error', 'Upload Screenshot may only authorized user');
        }
        return VZ.TimeTracker.methods.uploadTakenScreenshot(screenshotParams, userId);
    },

    /**
     * Check, whether was taken screenshot for current time interval
     * @param {string} timeEntryId - id of timeEntry, for which screenshot should be taken
     */
    'checkIfScreenshotNeeded': function (timeEntryId) {
        var userId = this.userId;
        if (!userId) {
            throw new Meteor.Error('permission-error', 'Check may only authorized user');
        }
        return VZ.TimeTracker.methods.checkIfScreenshotNeeded(timeEntryId, userId);
    },

    /**
     * Remove time entry
     * @param {string} timeEntryId - id of timeEntry, that should be removed
     */

    'removeTimeEntry': function (timeEntryId) {
        var userId = this.userId;
        if (!userId) {
            throw new Meteor.Error('permission-error', 'Remove time entry may only authorized user');
        }
        VZ.TimeTracker.methods.removeTimeEntry(timeEntryId, userId);
    },

    'deleteTimeEntryGroup': function (ids) {
        var userId = this.userId;
        if (!userId) {
            throw new Meteor.Error('permission-error', 'Must be authorized to delete');
        }
        VZ.TimeTracker.methods.deleteTimeEntryGroup(ids);
    },

    'timeEntriesCount': function () {
        var userId = this.userId;
        if (!userId) {
            throw new Meteor.Error('permission-error', 'Must be authorized');
        }
        return VZ.TimeTracker.methods.timeEntriesCount(userId);

    },

    'editTimeEntry': function (changeObj) {
        var userId = this.userId;
        if (!userId) {
            throw new Meteor.Error('permission-error', 'Must be authorized to edit');
        }
        return VZ.TimeTracker.methods.editTimeEntry(changeObj, userId);
    },

    'createEntryTag': function (tag) {
        var userId = this.userId;
        if (!userId) {
            throw new Meteor.Error('permission-error', 'Must be authorized');
        }
        return VZ.TimeTracker.methods.createEntryTag(tag, userId);
    },

    'getActiveTimeEntryId': function () {
        var userId = this.userId;
        if (!userId) {
            throw new Meteor.Error('permission-error', 'Must be authorized');
        }
        return VZ.TimeTracker.methods.getActiveTimeEntryId(userId);
    },

    'pingServer': function () {
        return true;
    }
});


var timeTracker = {
    startTracking: function (query, userId) {
        check(query, Object);
        check(userId, String);

        if (VZ.TimeTracker.methods._checkIsExistActiveTimeEntry(userId)) {
            throw new Meteor.Error('Only 1 active task allowed!');
        }

        query.startDate = _.isDate(query.startDate) ? query.startDate : new Date();

        _.extend(query, {userId: userId});
        var activeTimeEntryId = TimeEntries.insert(query, function (error) {
            if (error) {
                console.log(error);
                throw new Meteor.Error('Time Start failed');
            }
            console.log('start tracking ', userId, activeTimeEntryId);
        });
        console.log(activeTimeEntryId);
        Meteor.users.update({_id: userId}, {$set: {'profile.entryId': activeTimeEntryId}});
        return activeTimeEntryId;
    },
    // setCounterStartData: function(entryId, counterStartData) {
    //   TimeEntries.update({_id: entryId}, {
    //     $set: counterStartData
    //   });
    // },
    // getCounterStartData: function(query) {
    //   return TimeEntries.findOne(query).counterStartData;
    // },
    stopTracking: function (entryId, userId, endDate) {
        var stopTrackingSync = new Future();
        check(entryId, String);
        check(userId, String);

        if (!VZ.TimeTracker.methods._checkIsExistActiveTimeEntry(userId)) {
            //throw new Meteor.Error('No active tasks!');
            stopTrackingSync.throw('No active tasks!');
            return;
        }
        var entry = TimeEntries.findOne(entryId);
        if (!entry || userId != entry.userId) {
            //throw new Meteor.Error('Time entry\'s user id doesn\'t not match yours');
            stopTrackingSync.throw('Time entry\'s user id doesn\'t not match yours');
            return;
        }
        if (!entry.endDate) {
            endDate = _.isDate(endDate) ? endDate : new Date();
            TimeEntries.update({
                _id: entry._id
            }, {
                $set: {
                    endDate: endDate,
                    _done: true,
                    _isActive: false,
                    _totalMinutes: moment(endDate).diff(entry.startDate, 'm')
                }
            }, function (error) {
                if (error) {
                    //to logger later
                    console.log(error);
                    //throw new Meteor.Error('Failed stop tracking');
                    stopTrackingSync.throw('Failed to stop tracking');
                    return;
                }
                console.log('stop tracking ', userId, entryId);

                // update project info
                const timeEntryUpdated = TimeEntries.findOne(entry._id);
                const duration = getTimeEntryDuration(timeEntryUpdated);
                const taskId = timeEntryUpdated.taskId;
                let contractedTime, paymentType, paymentRate;
                if(entry.contractId) {
                    contractedTime = duration;
                    paymentType = timeEntryUpdated.paymentType;
                    paymentRate = timeEntryUpdated.paymentRate;
                }
                let query = {
                    $unset: {'profile.entryId': ''}
                };
                query.$set = {'profile.lastWorkedEntryId': entry._id};
                updateProjectInfo(entry.projectId, duration, contractedTime, 'add', paymentType, paymentRate);
                stopTrackingSync.return(TimeEntries.findOne({_id: entry._id}));
                Meteor.users.update({_id: userId}, query);
            });
        } else {
            //throw new Meteor.Error('Not Authorised', 'You already finished your task.');
            stopTrackingSync.throw('Not Authorised', 'You already finished your task.');
            return;
        }
        return stopTrackingSync.wait();
    },

    syncTimeEntry: function (timeEntry) {
        check(timeEntry, Object);

        var sameEntry = TimeEntries.findOne({_id: timeEntry._id});

        if (_.isDate(timeEntry.endDate)) {
            timeEntry._totalMinutes = moment(timeEntry.endTime).diff(timeEntry.startTime, 'm');
        }

        if (!!sameEntry) {
            TimeEntries.update(sameEntry._id, {$set: timeEntry});
        } else {
            var id = TimeEntries.insert(timeEntry);
        }

        return id || sameEntry._id;
    },

    markTimeEntryAsTrackedByApp: function (timeEntryId, userId) {
        var entry = TimeEntries.findOne(timeEntryId);
        if (!entry || userId != entry.userId) {
            throw new Meteor.Error('Time entry\'s user id doesn\'t not match yours');
        }

        return TimeEntries.update(timeEntryId, {
            $set: {
                _trackedByDesktopApp: true
            }
        });
    },

    addManualTime: function (params, userId) {
        check(params, Object);
        check(userId, String);

        var timeEntry = {
            _done: true,
            _isActive: false,
            _isManual: true,
            _totalMinutes: params.minutes,
            _initiatedByDesktopApp: false,
            _trackedByDesktopApp: false,

            userId: userId,
            startDate: params.startDate,
            endDate: params.endDate,
            message: params.message,
            projectId: params.projectId,
            tags: params.tags
        };

        TimeEntries.insert(timeEntry, function (error) {
            if (!error) {
                //-------------------NOTIFICATIONS SENDING----------------------------
                var user = Meteor.users.findOne({_id: userId});
                var project = Projects.findOne({_id: params.projectId});
                var query = {};
                query['roles.' + params.projectId] = {$in: ['project-manager', 'project-admin']}
                var managersAndAdmins = Meteor.users.find(query).fetch();
                managersAndAdmins = _.map(managersAndAdmins, function (doc) {
                    return doc._id;
                });
                managersAndAdmins.push(userId);
                managersAndAdmins = _.uniq(managersAndAdmins);

                var msg = 'Timetracker - added manual hours by user ' + user.profile.fullName + ' for project ' + project.name;
                Meteor.call('sendNotifications', 'Added manual hours', msg, managersAndAdmins);

                // updating project info
                const contract = Contracts.findOne({projectIds: params.projectId});
                const countTime = getTimeEntryDuration({startDate: params.startDate, endDate: params.endDate});
                if(contract && contract.status === 'active') {
                    const contractedTime = countTime;
                    updateProjectInfo(params.projectId, countTime, contractedTime, 'add', contract.paymentType, contract.paymentRate);
                } else {
                    updateProjectInfo(params.projectId, countTime);
                }
            } else {
                console.log(error);
                throw new Meteor.Error('Fail adding manual time');
            }
        });
    },

    uploadTakenScreenshot: function (screenshotParams, userId) {
        check(userId, String);
        check(screenshotParams, Object);

        var timeEntry = TimeEntries.findOne(screenshotParams.timeEntryId);
        if (!timeEntry) {
            throw new Meteor.Error('invalid-data-error', 'Time entry not found');
        }
        if (timeEntry.userId != userId) {
            throw new Meteor.Error('permission-error', 'Time entry\'s user id doesn\'t not match yours');
        }
        var isWasUploadedBefore = Screenshots.findOne(screenshotParams._id);
        if (!!isWasUploadedBefore) {
            throw new Meteor.Error('screenshot-already-exist-error',
                'This screenshot is already exists!');
        }

        var mediaLink = Meteor.call('uploadPhoto', screenshotParams);

        var id = Screenshots.insert({
            _id: screenshotParams._id,
            timeEntryId: screenshotParams.timeEntryId,
            screenshotOriginalURL: mediaLink,
            screenshotThumbnailPreviewURL: mediaLink,
            takenAt: screenshotParams.takenAt || new Date(),
            uploadedAt: new Date(),
            keyEvents: screenshotParams.keyEvents,
            mouseEvents: screenshotParams.mouseEvents
        });

        console.log('Screenshot ' + id + ' was uploaded');

        return id;
    },
    checkIfScreenshotNeeded: function (timeEntryId, userId) {
        check(userId, String);
        var timeEntry = TimeEntries.findOne(timeEntryId);
        if (!timeEntry) {
            throw new Meteor.Error('Time entry not found')
        }
        if (timeEntry.userId != userId) {
            throw new Meteor.Error('Time entry\'s user id doesn\'t not match yours');
        }
        var getCurrentTimeBlockStartTime = function (timeEntryStartMoment) {
            var SCREENSHOT_TIME_INTERVAL = 10; // minutes
            var currentIntervalStartMoment = moment(
                timeEntryStartMoment);
            var currentMoment = moment();

            while (currentIntervalStartMoment < currentMoment) {
                currentIntervalStartMoment.add(
                    SCREENSHOT_TIME_INTERVAL, 'minutes');
            }

            currentIntervalStartMoment.subtract(
                SCREENSHOT_TIME_INTERVAL, 'minutes');
            return currentIntervalStartMoment.toDate();
        };
        var timeEntryStartMoment = moment(timeEntry.startDate);
        var currentTimeIntervalStartsAt =
            getCurrentTimeBlockStartTime(timeEntryStartMoment);

        var screenshot = Screenshots
            .findOne({
                createdAt: {
                    $gte: currentTimeIntervalStartsAt
                }
            });

        // if screenshot was found, returns false, if not, returns true
        return !screenshot;
    },
    removeTimeEntry: function (timeEntryId, userId) {
        check(timeEntryId, String);
        check(userId, String);

        var timeEntry = TimeEntries.findOne(timeEntryId);
        if (!timeEntry) {
            throw new Meteor.Error('Time entry not found')
        }
        if (timeEntry.userId != userId) {
            throw new Meteor.Error('Time entry\'s user id doesn\'t not match yours');
        }
        TimeEntries.remove(timeEntry);

        // updating project info
        const duration = getTimeEntryDuration(timeEntry);
        let contractedTime, paymentType, paymentRate;
        if(timeEntry.contractId) {
            contractedTime = duration;
            paymentType = timeEntry.paymentType;
            paymentRate = timeEntry.paymentRate;
        }
        updateProjectInfo(timeEntry.projectId, duration, contractedTime, 'subtract', paymentType, paymentRate);
    },
    deleteTimeEntryGroup: function (ids) {
        check(ids, Array);
        _.each(ids, function (id) {
            check(id, String);
        });
        const timeEntries = TimeEntries.find({_id: {$in: ids}}).fetch();
        TimeEntries.remove({_id: {$in: ids}});

        // update project info in all projects affected
        let projectsArr = [];
        timeEntries.forEach(timeEntry => {
            if(!(projectsArr[timeEntry.projectId] instanceof Array)) {
                projectsArr[timeEntry.projectId] = [];
            }
            projectsArr[timeEntry.projectId].push(timeEntry);
        });

        for(let projectId in projectsArr) {
            const project = projectsArr[projectId];
            let projectCountedTime = 0;
            let projectContractedTime = 0;
            let paymentType, paymentRate;
            for(let x = 0, count = project.length; x < count; x++) {
                projectCountedTime += getTimeEntryDuration(project[x]);
                if(project[x].contractId) {
                    if(!paymentType) {
                        paymentType = project[x].paymentType;
                        paymentRate = project[x].paymentRate;
                    }
                    projectContractedTime += getTimeEntryDuration(project[x]);
                }
            }
            updateProjectInfo(projectId, projectCountedTime, projectContractedTime, 'subtract', paymentType, paymentRate);
        }
    },
    timeEntriesCount: function (userId) {
        check(userId, String);
        var timeEntriesCount = TimeEntries.find({
            userId: userId,
            _done: true,
            _isActive: false
        }).count();
        return timeEntriesCount ? timeEntriesCount : undefined;
    },
    editTimeEntry: function (changeObj, userId) {
        check(changeObj, Object);
        check(userId, String);

        _.each(changeObj, function (value, key) {
            if (key === 'startDate' || key === 'endDate') {
                check(value, Date);
            } else if (key === '_totalMinutes') {
                check(value, Number);
            } else if (key === 'tags') {
                check(value, [String])
            } else {
                check(value, String)
            }
        });

        var timeEntry = TimeEntries.findOne({_id: changeObj._id});
        var minutesBeforeUpdate = timeEntry._totalMinutes;
        var minutesAfterUpdate = changeObj._totalMinutes;

        TimeEntries.update({_id: changeObj._id}, {$set: changeObj});

        // updating project info
        const timeEntryUpdated = TimeEntries.find({_id: changeObj._id});
        const durationOld = getTimeEntryDuration(timeEntry);
        const durationUpdated = getTimeEntryDuration(timeEntryUpdated);
        let contractedTimeOld, contractedTimeNew, paymentType, paymentRate;
        if(timeEntryUpdated.contractId) {
            contractedTimeOld = durationOld;
            contractedTimeNew = durationUpdated;
            paymentType = timeEntryUpdated.paymentType;
            paymentRate = timeEntryUpdated.paymentRate;
        }
        updateProjectInfo(timeEntryUpdated.projectId, durationOld, contractedTimeOld, 'subtract', paymentType, paymentRate);
        updateProjectInfo(timeEntryUpdated.projectId, durationUpdated, contractedTimeNew, 'add', paymentType, paymentRate);

        //-------------------NOTIFICATIONS SENDING----------------------------
        if (minutesAfterUpdate != minutesBeforeUpdate && timeEntry.projectId) {
            var user = Meteor.users.findOne({_id: userId});
            var project = Projects.findOne({_id: timeEntry.projectId});
            var query = {};
            query['roles.' + timeEntry.projectId] = {$in: ['project-manager', 'project-admin']};
            var managersAndAdmins = Meteor.users.find(query).fetch();
            managersAndAdmins = _.map(managersAndAdmins, function (doc) {
                return doc._id;
            });
            managersAndAdmins.push(userId);
            managersAndAdmins = _.uniq(managersAndAdmins);

            var msg = 'Timetracker - hours modified by user ' + user.profile.fullName + ' for project ' + project.name;
            Meteor.call('sendNotifications', 'Modified manual hours', msg, managersAndAdmins);
        }
    },
    createEntryTag: function (tag, userId) {
        check(userId, String);
        if (!tag) {
            throw new Meteor.Error('Tag required');
        }
        EntryTags.insert({
                name: tag,
                userId: userId,
                createdAt: new Date()
            },
            function (error) {
                if (error) {
                    console.log(error);
                    throw new Meteor.Error('Failed to insert');
                }
            });
    },
    getActiveTimeEntryId: function (userId) {
        check(userId, String);
        var activeTimeEntry = TimeEntries.findOne({_isActive: true, userId: userId});
        return activeTimeEntry ? activeTimeEntry._id : undefined;
    },

    _checkIsExistActiveTimeEntry: function (userId) {
        return TimeEntries.findOne({_isActive: true, userId: userId});
    }
};

function countEarned(paymentType, paymentRate, timeContracted) {
    if(paymentRate <= 0 || timeContracted <= 0) return 0;
    if(paymentType === 'hourly') {
        const oneHour = 1000 * 60 * 60;
        return (timeContracted * paymentRate / oneHour).toFixed(2);
    } else if(paymentType === 'monthly') {
        const oneMonth = 1000 * 60 * 60 * 24 * 30;
        return (timeContracted * paymentRate / oneMonth).toFixed(2);
    } else if(paymentType === 'fixed') {
        return 0; // no concrete info on the meaning of fixed rate yet, suppose it is payed after contract fullfilled
    } else {
        throw new Meteor.Error(`payment type ${paymentType} is wrong`);
    }
}

// function to initialize info object or add fields to it
function makeInfoReady(info) {
    let result = info;
    if(result == undefined) {
        result = {};
    }
    if(!result.totalTrackedTime) {
        result.totalTrackedTime = 0;
    }
    if(!result.totalContractedTime) {
        result.totalContractedTime = 0;
    }
    if(!result.totalEarned) {
        result.totalEarned = 0;
    }
    return result;
}

function getTimeEntryDuration(timeEntry) {
    //console.log('getTimeEntryDuration', timeEntry);
    return timeEntry.endDate.valueOf() - timeEntry.startDate.valueOf();
}

function updateProjectInfo(projectId, timeCount, timeContracted = 0, action = 'add', paymentType = 'hourly', paymentRate = 0) {
    console.log('updateProjectInfo', projectId, timeCount, timeContracted, action, paymentType, paymentRate);
    if(action === 'subtract') {
        timeCount *= -1;
        timeContracted *= -1;
    } else if(action !== 'add' && action !== 'subtract') {
        throw new Meteor.Error(`wrong update action, use 'add' or 'subtract'`);
    }

    const project = Projects.findOne(projectId, {fields: {info: 1}});
    if(project === undefined) {
        console.error(`Project with id ${projectId} does not exists`);
    } else {
        if(Math.abs(timeContracted) > 0) {
            let info = makeInfoReady(project.info);
            info.totalTrackedTime += timeCount;
            info.totalContractedTime += timeContracted;
            if(info.totalTrackedTime < 0) {
                info.totalTrackedTime = 0;
            }
            if(info.totalContractedTime < 0) {
                info.totalContractedTime = 0;
            }
            info.totalEarned = countEarned(paymentType, paymentRate, info.totalContractedTime);
            Projects.update(projectId, {$set: {info}});
        } else if(timeContracted === 0) {
            let info = makeInfoReady(project.info);
            info.totalTrackedTime += timeCount;
            if(info.totalTrackedTime < 0) {
                info.totalTrackedTime = 0;
            }
            Projects.update(projectId, {$set: {info}});
            console.log('updated project info', Projects.findOne(projectId).info);
        } else {
            throw new Meteor.Error(`contractedTime should be positive integer!`);
        }
    }
}

VZ.TimeTracker.methods = timeTracker;
