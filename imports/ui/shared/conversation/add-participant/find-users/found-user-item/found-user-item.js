import './found-user-item.html';

Template.foundUserItem.helpers({
});

Template.foundUserItem.events({
    'change input': function (event, tmpl) {
        if (event.target.checked) {
            tmpl.data.onAddUser(tmpl.data.user._id);
        }
    }
});