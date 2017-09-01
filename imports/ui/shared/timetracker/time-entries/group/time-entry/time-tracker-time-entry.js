import './edit-entry/time-tracker-edit-entry';
import './show-entry/time-tracker-show-entry';
import './time-tracker-time-entry.html';

Template.timeEntry.onCreated(function () {
    var self = this;
    this.editEntry = new ReactiveVar(false);
    this.changeEditState = function (state) {
        self.editEntry.set(state);
    }
});

Template.timeEntry.helpers({
    editEntry: function () {
        return Template.instance().editEntry.get();
    },

    changeStateCb: function () {
        return Template.instance().changeEditState;
    }

});

Template.timeEntry.events({});

Template.timeEntry.onRendered(function () {
});

Template.timeEntry.helpers({
    betweenHours: function () {
        var format = 'hh:mm A';
        return moment(this.startDate).format(format) + ' - ' + moment(this.endDate).format(format);
    },

    duration: function () {
        var duration = moment(this.endDate).diff(this.startDate), //milliseconds
            hours = parseInt(moment.duration(duration).asHours());
        if (hours < 10) {
            hours = '0' + hours;
        }
        return hours + moment.utc(duration).format(':mm:ss')
    }
});
