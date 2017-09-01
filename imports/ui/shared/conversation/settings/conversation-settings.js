import './conversation-settings.html';

Template.conversationSettings.events({
    'click .cancel': function (event,tmpl) {
        tmpl.data.changeComponent('messagesRegular');
    },
    'click .save': function (event,tmpl) {
        tmpl.data.changeComponent('messagesRegular');
    }
});