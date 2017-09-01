import './action-bar-item.html';

Template.actionBarItem.onRendered(function () {
})

Template.actionBarItem.events({
    'click .action-button': function (e, tmpl) {
        if(tmpl.data && tmpl.data.action){
            tmpl.data.action();
        }
    }
})