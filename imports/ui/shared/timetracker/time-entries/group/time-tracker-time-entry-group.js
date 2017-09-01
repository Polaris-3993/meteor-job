import './time-entry/time-tracker-time-entry';
import './time-tracker-time-entry-group.html';

Template.timeEntriesGroup.events({
    'click .time-entry-group-checkbox': function (event, tmpl) {
        if (event.target.checked) {
            tmpl.$('.time-entry-checkbox').prop('checked', true);
        } else {
            tmpl.$('.time-entry-checkbox').prop('checked', false);
        }
    },

    // .time-entry-checkbox exist in timeTrackerTimeEntry template
    'click .time-entry-checkbox': function (event, tmpl) {
        if (!event.target.checked) {
            tmpl.$('.time-entry-group-checkbox').prop('checked', false);
        } else if (tmpl.$('.time-entry-checkbox:not(:checked)').length == 0) {
            tmpl.$('.time-entry-group-checkbox').prop('checked', true);
        }

    }
});