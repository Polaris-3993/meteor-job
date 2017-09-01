import './styleguide.html';

Template.styleguide.onCreated(function(){
    this.date = new ReactiveVar(moment());
});

Template.styleguide.helpers({
    date: function() {
        return Template.instance().date;
    },

    onSaved : function() {
        var onSaved = function(date){
            console.log(date);
        }
        return onSaved;
    },

    onCanceled : function() {
        var onCanceled = function() {
            console.log('Canceled.')
        }
        return onCanceled;
    }

});
