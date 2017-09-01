import { VZ } from '/imports/startup/both/namespace';
import { Notifications } from '/imports/api/notifications/notifications';
import './notificationItem/notificationItem.html';
import './notifications.html';


Template.notifications.onCreated(function () {
    var self = this;
    
    this.markedNotifications = new ReactiveArray([]);
    this.notificationLimit = new ReactiveVar(10);
    this.clientDocsCount = new ReactiveVar();
    this.serverDocsCount = new ReactiveVar();
    
    this.autorun(function () {
        var limit = self.notificationLimit.get();
        self.subscribe('notifications', limit);
    });
    
    this.autorun(function() {
        self.clientDocsCount.set(Notifications.find().count());
        
        Meteor.call('notificationsCount', function (err, res) {
            if(err){
                console.log(err)
            } else {
                self.serverDocsCount.set(res);
            }
        })
    })
});

Template.notifications.helpers({
    notifications: function () {
        var notifications = Notifications.find({},{sort:{createdAt: -1}}).fetch();
        return notifications;
    },
    
    loadMore: function () {
        var clientDocsCount = Template.instance().clientDocsCount.get();
        var serverDocsCount = Template.instance().serverDocsCount.get();
        return serverDocsCount > clientDocsCount;
    },
    
    showMarkButton: function () {
        return Template.instance().markedNotifications.list().length > 0
    }
});

Template.notifications.events({
    'click .load-more-btn': function (e, tmpl) {
        var oldCount = tmpl.notificationLimit.get();
        tmpl.notificationLimit.set(oldCount + 10);
    },
    
    'change .mark-notification': function (e, tmpl) {
        var id = $(e.currentTarget).prop('id');
        if($(e.currentTarget).prop('checked')){
            tmpl.markedNotifications.push(id);
        } else {
            tmpl.markedNotifications.remove(id);
        }
    },
    
    'click .mark-as-read-btn': function (e, tmpl) {
        var ids = tmpl.markedNotifications.array();
        if(ids.length > 0){
            Meteor.call('markNotifications', ids, function (err, res) {
                if(err){
                    console.log(err);
                    VZ.notify('Failed to mark notifications')
                } else {
                    tmpl.markedNotifications.clear();
                    VZ.notify('Notifications marked')
                }
            })
        }
    }
});