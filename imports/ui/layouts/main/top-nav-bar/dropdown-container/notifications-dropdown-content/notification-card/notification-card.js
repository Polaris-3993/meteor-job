import { VZ } from '/imports/startup/both/namespace';
import './notification-card.html';

Template.notificationCard.helpers({
    creationDate: function () {
        return moment(this.createdAt).format('HH:mm DD MMM')
    }
})

Template.notificationCard.events({
    'click .mark-notification-icon': function (e, tmpl) {
        var id = [tmpl.data._id];
        Meteor.call('markNotifications', id, function (err, res) {
            if(err){
                console.log(err);
                VZ.notify('Failed to mark notification');
            } else {
                VZ.notify('Notification read');
            }
        })
    }
});