import { Notifications } from '/imports/api/notifications/notifications';
import './activity-list.html';

Template.dashboardActivityList.helpers({
    actionsItems: function () {
        return Notifications.find({}, {limit: 10}).fetch();
    },
    emptyCardMessage: function () {
        return 'Nothing to show in activity';
    }
});
