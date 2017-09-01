import { Notifications } from '/imports/api/notifications/notifications';
import './notifications-dropdown-content.html';

Template.notificationsDropdownContent.helpers({
    unreadNotifications: function () {
        return Notifications.find({isReaded: false}, {sort: {createdAt: -1}, limit: 5}).fetch()
    },

    haveNotifications: function () {
        return Notifications.find({isReaded: false}).count() > 0
    }
});

Template.notificationsDropdownContent.events({
    'click .all-notifications-button': function (event, tmpl) {
        tmpl.data.closeDropDown();
    }
});