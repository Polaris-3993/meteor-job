import './year-picker/year-picker';
import './date-picker.html';

var FORMAT = 'DD/MM/YYYY';

Template.datePicker.onCreated(function() {
    var currentDate = Template.instance().data.date;
    if(!currentDate)  currentDate = new ReactiveVar(moment());
    this.date = currentDate;
    this.state = new ReactiveVar('calendar');
});

Template.datePicker.helpers({
    year: function() {
        var currentDate = Template.instance().date.get();
        return currentDate.year();
    },

    date: function() {
        var date = Template.instance().date.get();
        return date.format('ddd, MMM DD');
    },

    currentMonth: function() {
        var date = Template.instance().date.get();
        return date.format('MMMM YYYY');
    },

    daysOfTheWeek: function() {
        var daysLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        return daysLabels;
    },

    calendar: function() {
        var date = Template.instance().date.get(),
            month = date.month(),
            year = date.year(),
            calendar = getCalendar(month, year);

        return calendar;
    },

    isEmptyDay: function(day) {
        return day ? '' : 'empty';
    },

    isActiveDay: function(day) {
        var currentDate = Template.instance().date.get();
        if(currentDate.date() == day) return 'active';
        var newDate = currentDate.clone();
        //prevent to select future date
        newDate.date(day);
        if(moment().diff(newDate, 'days', true) < 0) return 'disabled';
    },

    years: function() {
        var currentYear = moment().year(),
            intervalSize = 5,
            startYear = currentYear - intervalSize,
            years = [];

        for(var i = 0; i<intervalSize; i++){
            years.push(startYear+i+1);
        }

        return years;
    },

    isCalendarState: function() {
        return Template.instance().state.get() === 'calendar';
    },

    selectedDateReactiveVar : function() {
        return Template.instance().date;
    },

    showControls : function() {
        var options = Template.instance().data.options;
        if(options && !options.showControls){
            return false;
        }
        var onSaved = typeof Template.instance().data.onSaved === 'function';
        return onSaved;
    }

});

Template.datePicker.events({
    'click .save-btn' : function(event, tmpl) {
        var onSaved = tmpl.data.onSaved;
        if(typeof onSaved === 'function'){
            onSaved(tmpl.date, tmpl.view);
        }
    },

    'click .cancel-btn' : function(event, tmpl) {
        var onCanceled = tmpl.data.onCanceled;
        if(typeof onCanceled === 'function'){
            onCanceled(tmpl.date, tmpl.view);
        }
        Blaze.remove(tmpl.view);
    },

    'click .date-year' : function(event, tmpl) {
        tmpl.$('.date-line').removeClass('active');
        tmpl.$('.date-year').addClass('active');
        tmpl.state.set('year');
    },

    'click .date-line' : function(event, tmpl) {
        tmpl.$('.date-line').addClass('active');
        tmpl.$('.date-year').removeClass('active');
        tmpl.state.set('calendar');
    },

    'click .pagination-left': function(event, tmpl) {
        var date = tmpl.date.get().subtract(1, 'months');

        tmpl.date.set(date);
    },

    'click .pagination-right': function(event, tmpl) {
        var date = tmpl.date.get(),
            newDate = date.clone();
            newDate.add(1, 'months');
        //prevent to select future date
        if(moment().diff(newDate, 'days', true) < 0) return ;

        tmpl.date.set(newDate);
    },

    'click .calendar-table td': function(event, tmpl) {
        var $element = $(event.target);

        if ($element.hasClass('empty') || $element.hasClass('disabled') ) return;

        var day = Number($element.text()),
            currentDate = tmpl.date.get();

        currentDate.date(day);
        tmpl.date.set(currentDate);

        $('.calendar-table td').removeClass('active');
        $element.addClass('active');

    }

});

function getCalendar(month, year) {
    var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    var month, year;
    // get first day of month
    var firstDay = new Date(year, month, 1);
    var startingDay = firstDay.getDay();

    // find number of days in month
    var monthLength = daysInMonth[month];

    // compensate for leap year
    if (month == 1) { // February only!
        if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
            monthLength = 29;
        }
    }
    var calendar = [];

    // fill in the days
    var day = 1;
    // this loop is for weeks (rows)
    for (var i = 0; i < 9; i++) {
        var row = [];
        // this loop is for weekdays (cells)
        for (var j = 0; j <= 6; j++) {
            var currentDay = null;

            if (day <= monthLength && (i > 0 || j >= startingDay)) {
                currentDay = day;
                day++;
            }

            row.push(currentDay);
        }
        calendar.push(row);
        // stop making rows if we've run out of days
        if (day > monthLength) {
            break;
        }
    }
    return calendar;
}
