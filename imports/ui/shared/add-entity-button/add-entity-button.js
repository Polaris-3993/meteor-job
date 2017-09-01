import './add-entity-button.html';

Template.addEntityButton.events({
    'click .add-entity-button': function (event, tmpl) {
        event.preventDefault();
        Router.go(tmpl.data.routeName, tmpl.data.routeParams);
    }
});