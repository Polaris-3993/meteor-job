import { Notifications } from './notifications';

Meteor.methods({
    sendNotifications: function (title, msg, usersIdsArray) {
        usersIdsArray = _.isArray(usersIdsArray) ? usersIdsArray : [usersIdsArray];
        check(title, String);
        check(msg, String);
        check(usersIdsArray, [String]);

        if(usersIdsArray.length > 0){
            var notificationObj = {
                title: title,
                message: msg,
                createdAt: moment().toDate(),
                isReaded: false,
                createdBy: this.userId
            };

            _.each(usersIdsArray, function (userId) {
                var obj = {
                    userId: userId
                };
                _.extend(obj, notificationObj);

                Notifications.insert(obj);
            })
        }
    },

    unreadNotificationsCount: function () {
        var userId = this.userId;

        if(userId){
            return Notifications.find({
                userId: userId,
                isReaded: false
            }).count();
        }
    },

    notificationsCount: function () {
        var userId = this.userId;

        if(userId){
            return Notifications.find({
                userId: userId
            }).count();
        }
    },

    markNotifications: function (notificationsArray) {
        check(notificationsArray, [String]);
        var userId = this.userId;

        if(this.userId){
            Notifications.update({_id:{$in: notificationsArray}, userId: userId}, {$set:{isReaded: true}}, {multi: true});
        }
    }
});