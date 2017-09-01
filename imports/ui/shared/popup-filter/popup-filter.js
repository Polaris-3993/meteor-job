import './filter-item/filter-item';
import './popup-filter.html';

Template.popupFilter.onCreated(function () {
    var self = this;
    this.searchString = new ReactiveVar();
    
    this.autorun(function(){
        var string = self.searchString.get();
        self.subscribe(self.data.subscription, string);
    })
})

Template.popupFilter.onRendered(function () {
    var self = this;
    this.$('#popup-modal').modal();
    this.$('#popup-modal').modal('open');

    $('.lean-overlay').on('click', function () {
        self.data.isPopupActive.set(false);
    });
})

Template.popupFilter.helpers({
    isHaveSuchItem: function () {
        var self = this;
        var searchItem = Template.instance().searchString.get();
        if(searchItem && searchItem.trim().length > 0){
            var itemCount = Meteor.connection._mongo_livedata_collections[self.collection].find({name: searchItem}).count()
            return itemCount > 0
        }
        return true
    },
    
    items: function () {
        var self = this;
        var searchString = Template.instance().searchString.get();
        var items;
        if(searchString && searchString.trim().length > 0){
            items = Meteor.connection._mongo_livedata_collections[self.collection].find({
                name:{
                    $regex: searchString
                }
            }).fetch();
        } else {
            items = Meteor.connection._mongo_livedata_collections[self.collection].find().fetch()
        }
        
        items.unshift({
            _id: 'No' + self.label,
            name: 'No ' + self.label,
        });
        
        return items;
    },
    
    filter: function () {
        return Template.instance().data.filter
    }
});

Template.popupFilter.events({
    'input .filter-input': function (e, tmpl) {
        tmpl.searchString.set($(e.currentTarget).val());
    }
})