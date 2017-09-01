import './contracts-list-item.html';

Template.contractListItem.events({
    'click a': function (event, tmpl) {
        Router.go('contract', {id: tmpl.data.contract._id});
    }
});