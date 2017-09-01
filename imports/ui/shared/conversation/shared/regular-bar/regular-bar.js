import './regular-bar.html';

Template.regularBar.events({
    'click .open-members-list-icon': function (event, tmpl) {
        tmpl.data.changeComponent('participantsList');
    },
    'click .search-button': function (event, tmpl) {
        tmpl.data.changeComponent('messagesSearch');
    },
    'click .action-setting': function (event, tmpl) {
        tmpl.data.changeComponent('settings');
    }
});