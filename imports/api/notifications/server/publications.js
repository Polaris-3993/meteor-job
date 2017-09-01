import { Notifications } from '../notifications';

Meteor.publish('unreadNotifications', function () {
    var userId = this.userId;
    if(userId){
        return Notifications.find({
            userId: userId,
            isReaded: false
        }, {sort:{createdAt: -1}, limit: 5})
    }
});

Meteor.publish('notifications', function(limit) {
    var userId = this.userId;
    if(userId){
        return Notifications.find({
            userId: userId
        }, {sort:{createdAt: -1}, limit: limit})
    }
})