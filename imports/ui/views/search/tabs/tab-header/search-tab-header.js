import './search-tab-header.html';

Template.searchTabHeader.events({
    'click .show-all-link': function (e, tmpl) {
        tmpl.$("#"+tmpl.data.clickId+">a").trigger('click');
    }
});

Template.searchTabHeader.helpers({
    showLink: function () {
        var collection = Meteor.connection._mongo_livedata_collections[this.collection];
        return collection && collection.find().count() >= 5
    }
});