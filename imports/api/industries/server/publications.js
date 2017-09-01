import { Industries } from '../industries';

Meteor.publish('industries', function (userId) {
    if(userId === 'wh8or4SeGKKr5WTDs' || this.userId){
        return Industries.find();
    }
    else {
        return this.ready();
    }
});

Meteor.publish('oneIndustryForAdmin', function (id, userId) {
    if(userId === 'wh8or4SeGKKr5WTDs' || this.userId){
        return Industries.find({_id: id});
    }
    else {
        return this.ready();
    }
});
