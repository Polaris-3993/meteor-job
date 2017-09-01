import './action-bar-item/action-bar-item';
import './action-bar.html';

Template.actionBar.onRendered(function () {
})

Template.actionBar.helpers({
    items: function () {
        return this;
    }
})