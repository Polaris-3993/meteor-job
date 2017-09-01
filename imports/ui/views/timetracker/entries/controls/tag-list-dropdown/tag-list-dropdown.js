import { VZ } from '/imports/startup/both/namespace';
import { EntryTags } from '/imports/api/entryTags/entryTags';
import './tag-list-dropdown.html';
import './tag-item/tag-item';


Template.tagListDropdown.onCreated(function () {
    var self = this;
    this.tagSearchString = new ReactiveVar();
    
    this.autorun(function(){
        var string = self.tagSearchString.get();
        self.subscribe('tags', string);
    })
});

Template.tagListDropdown.onRendered(function () {
    var self = this;
    this.$('#tag-list-modal').modal();
    this.$('#tag-list-modal').modal('open');

    $('.lean-overlay').on('click', function () {
        self.data.isTagPopupActive.set(false);
    });
});

Template.tagListDropdown.helpers({
    isHaveSuchTag: function () {
        var searchTag = Template.instance().tagSearchString.get();
        if(searchTag && searchTag.trim().length > 0){
            var tagsCount = EntryTags.find({userId: Meteor.userId(), name: searchTag}).count()
            return tagsCount > 0
        }
        return true
    },
    
    currentInput: function () {
        return Template.instance().tagSearchString.get();
    },
    
    tags: function () {
        var searchString = Template.instance().tagSearchString.get();
        if(searchString && searchString.trim().length > 0){
            return EntryTags.find({
                userId: Meteor.userId(),
                name:{
                    $regex: searchString
                }
            })
        } else {
            return EntryTags.find({
                userId: Meteor.userId()
            })
        }
    },
    
    tagArray: function () {
        return Template.instance().data.tagArray
    }
});

Template.tagListDropdown.events({
    'input .tag-input': function (e, tmpl) {
        tmpl.tagSearchString.set($(e.currentTarget).val());
    },
    
    'click .create-tag-link': function (e, tmpl) {
        var tag = tmpl.tagSearchString.get()
        Meteor.call('createEntryTag', tag, function(err, res){
            if(err){
                console.log(err);
                VZ.notify('Failed to create tag')
            } else {
                VZ.notify('Tag created');
                tmpl.tagSearchString.set();
                tmpl.$('.tag-input').val('');
            }
        });
    }
})