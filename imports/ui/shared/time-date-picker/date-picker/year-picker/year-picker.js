import './year-picker.html';

Template.yearPicker.onRendered(function(){
    var scrollContainerHeight = $('.year-picker').height();
    
});

Template.yearPicker.helpers({
    isActiveYear: function(year) {
        var selectedYear = Template.instance().data.selectedDateReactiveVar.get().year();
        if(selectedYear == year)
            return 'active';
    }
});

Template.yearPicker.events({
    'click .year-item' : function(event, tmpl) {
        var $element = $(event.target),
            year = Number($element.text()),
            date = tmpl.data.selectedDateReactiveVar.get();
            
        date.year(year);
        //prevent of setting future date
        if(moment().diff(date, 'days', true) < 0 ) date = moment();
        tmpl.data.selectedDateReactiveVar.set(date);
        
        tmpl.$('.year-item').removeClass('active');
        $element.addClass('active');
    }
})