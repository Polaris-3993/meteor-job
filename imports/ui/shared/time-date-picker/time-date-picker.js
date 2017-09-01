import './date-picker/date-picker';
import './time-picker/time-picker';
import './time-date-picker.html';

Template.timeDatePicker.onCreated(function(){
    this.state = new ReactiveVar('date');
});

Template.timeDatePicker.events({
    'click .calendar-table td' : function(e, tmpl){
        if($(e.currentTarget).hasClass('empty')) return;
        tmpl.state.set('time');
    },

    'click .time-picker .date' : function(e,tmpl) {
        tmpl.state.set('date');
    },

    'click .time-picker .save-btn' : function(event, tmpl) {
        Blaze.remove(tmpl.view);
    },

    'click .cancel-btn' : function(event, tmpl) {
        Blaze.remove(tmpl.view);
    }
});

Template.timeDatePicker.helpers({
    timePick : function() {
        return Template.instance().state.get() === 'time';
    }

    // datePickerChangeState : function() {
    //     var tmpl = Template.instance();
    //     return function(){
    //         console.log('set state to timepicker')
    //         tmpl.state.set('time');
    //     }
    // }
});
