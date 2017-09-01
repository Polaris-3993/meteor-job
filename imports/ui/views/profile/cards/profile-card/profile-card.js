import { VZ } from '/imports/startup/both/namespace';
import './profile-card.html';
import './edit-card/edit-card';
import './show-card/show-card';

Template.profileCard.onCreated(function () {
    this.editState = new ReactiveVar(false);
});

Template.profileCard.helpers({
    editState: function () {
        var tmpl = Template.instance();
        return tmpl.editState.get();
    },

    isEditable: function (fieldName) {
        return fieldName != 'projectsDone' && fieldName != 'activeProjects';
    },
    profileOwner: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        return user && Meteor.userId() == user._id;
    }
});

Template.profileCard.events({
    'click .edit-button': function (event, tmpl) {
        tmpl.editState.set(!tmpl.editState.get());
    },

    'submit #editCardForm': function (event, tmpl) {
        event.preventDefault();
        var profileField = tmpl.data.profileField;
        var data = tmpl.$('#editCard'+profileField),
            maxLength = 300;
            
        if(data.val().trim().length == 0){
            VZ.notify("Please enter some information");
            return
        }
        if (data.val() > maxLength) {
            $('.toast').hide();
            VZ.notify('Message should contain less then 300 symbols', 5000);
            return;
        }
        
        Meteor.call('editCard', data.val(), profileField, function (err) {
            if (err) {
                $('.toast').hide();
                Materialize.toast(err, 5000);
            }
        });
        tmpl.editState.set(false);

    }
});
