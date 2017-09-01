import './search-user-bar.html';

Template.searchUserBar.events({
    'click .close': function (event, tmpl) {
        tmpl.data.onRemoveUser(this.toString());
    }
});