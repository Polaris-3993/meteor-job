import './location-card.html';
import './edit-card/edit-location-card';
import './show-card/show-location-card';

Template.locationCard.onCreated(function () {
    this.editState = new ReactiveVar(false);
});

Template.locationCard.helpers({
    editState: function () {
        var tmpl = Template.instance();
        return tmpl.editState.get();
    },

    editStateCb: function () {
        return Template.instance().editState
    },

    profileOwner: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (user) {
            return Meteor.userId() === user._id;
        }

        return false
    }
});

Template.locationCard.events({
    'click .edit-button': function (event, tmpl) {
        tmpl.editState.set(!tmpl.editState.get());
    },

    'submit #editCardForm': function (event, tmpl) {
    }
});
