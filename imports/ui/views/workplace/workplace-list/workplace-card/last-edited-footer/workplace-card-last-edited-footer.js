import './workplace-card-last-edited-footer.html';

Template.lastEditedByFooter.events({
    'click .user-avatar': function (event, tmpl) {
        Router.go('userProfile', {id: tmpl.data.editedBy});
    }
});