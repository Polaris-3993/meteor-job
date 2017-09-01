import './participant-avatar.html';

Template.participantAvatar.events({
    'click .participant-avatar': function (event, tmpl) {
        Router.go('userProfile', {id: tmpl.data.userId});
    }
});