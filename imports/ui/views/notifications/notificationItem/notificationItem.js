import './notificationItem.html';

Template.notificationItem.onRendered(function () {
});

Template.notificationItem.helpers({
    creationDate: function () {
        return moment(this.createdAt).format("HH:mm DD MMM")
    },
    
    isReaded: function () {
        return this.isReaded
    }
});