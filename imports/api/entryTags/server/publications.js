import { EntryTags } from '../entryTags';

Meteor.publish('tags', function (searchString) {
    var userId = this.userId;
    if(userId){
        if(searchString && searchString.trim().length > 0){
            return EntryTags.find({
                userId: userId,
                name:{
                    $regex: searchString
                }
            })
        } else {
            return EntryTags.find({
                userId: userId
            })
        }
    }
    this.ready();
});

Meteor.publish('tagsForEntry', function (idArray) {
    var userId = this.userId;
    if(userId){
        return EntryTags.find({
            _id:{$in: idArray}
        })
    }
});