import { Positions } from '../positions';

Meteor.publish('positions', function (userId) {
    if(userId === 'wh8or4SeGKKr5WTDs' || this.userId){
        return Positions.find();
    }
    else {
        return this.ready();
    }
});

Meteor.publish('onePositionForAdmin', function (id, userId) {
    if(userId === 'wh8or4SeGKKr5WTDs' || this.userId){
        return Positions.find({_id: id});
    }
    else {
        return this.ready();
    }
});