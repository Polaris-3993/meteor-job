import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { VZ } from '/imports/startup/both/namespace';
import './conversations-manager/conversations-manager';
import './left-menu/left-menu';
import './top-nav-bar/top-nav-bar';
import './main.html';

Template.mainLayout.onCreated(function () {
    var self = this;
    this.autorun(function () {
        var user = Meteor.users.findOne({_id: Meteor.userId()});
        var entryId = user && user.profile && user.profile.entryId;
        if(entryId){
            self.subscribe('activeTimeEntryTab', entryId);
        }
    });
});
Template.mainLayout.onRendered(function () {
});

Template.mainLayout.helpers({
    user: function () {
        return !!Meteor.user();
    },
    setTitle: function () {
        var user = Meteor.users.findOne({_id: Meteor.userId()});
        var entryId = user && user.profile && user.profile.entryId;
        if(entryId){
            if (VZ.TimeTracker.instance.isRunning.get()) {
                var timeEntry = TimeEntries.findOne({_id: entryId});
                var timeEntryMessage = timeEntry.message.split(':');
                timeEntryMessage  = timeEntryMessage[0];
                var secondsElapsed = VZ.TimeTracker.instance.timeElapsed.get(),
                    millisec = secondsElapsed * 1000;
                var hours = parseInt(moment.duration(millisec).asHours());
                if (hours < 10) {
                    hours = '0' + hours;
                }
                var timeElapsed = hours + moment.utc(millisec).format(':mm:ss');
                var title = timeEntryMessage + ' - ' + timeElapsed;
                document.title = title;
            }
        }
        else {
            document.title = 'Vezio';
        }
    }
});
