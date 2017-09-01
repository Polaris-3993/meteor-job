import { VZ } from '/imports/startup/both/namespace';
import './tag-item.html';

Template.tagItem.onCreated(function () {
    
});

Template.tagItem.onRendered(function () {
    var tagArray = this.data.tagArray.array();
    var tagId = this.data.tag._id;
    if(_.contains(tagArray, tagId)){
        this.$('#'+tagId).prop('checked', true);
    }
})

Template.tagItem.events({
    'change .tag-checkbox': function (e, tmpl) {
        var isChecked = $(e.currentTarget).prop('checked');
        if(isChecked){
            if(tmpl.data.tagArray.array().length > 4){
                VZ.notify('Max 5 tags allowed');
                $(e.currentTarget).prop('checked', false);
            } else {
                tmpl.data.tagArray.push(tmpl.data.tag._id);
            }
        } else {
            tmpl.data.tagArray.remove(tmpl.data.tag._id);
        }
    }
})