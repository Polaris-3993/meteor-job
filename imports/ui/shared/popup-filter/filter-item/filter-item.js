import './filter-item.html';

import { VZ } from '/imports/startup/both/namespace';
Template.filterItem.onCreated(function () {
    
});

Template.filterItem.onRendered(function () {
    var itemArray = this.data.filter.array();
    var itemId = this.data.item._id;
    if(_.contains(itemArray, itemId)){
        this.$('#'+itemId).prop('checked', true);
    }
})

Template.filterItem.events({
    'change .item-checkbox': function (e, tmpl) {
        var isChecked = $(e.currentTarget).prop('checked');
        if(isChecked){
            if(tmpl.data.filter.array().length > 4){
                VZ.notify('Max 5 items allowed');
                $(e.currentTarget).prop('checked', false);
            } else {
                tmpl.data.filter.push(tmpl.data.item._id);
            }
        } else {
            tmpl.data.filter.remove(tmpl.data.item._id);
        }
    }
})