import './minutes.html';

Template.timePickerMinutesState.onRendered(function(){
    var number = +this.data.number;
    this.$('.analog-hour').removeClass('active');
    this.$('#' + number + 'm').addClass('active');
});
