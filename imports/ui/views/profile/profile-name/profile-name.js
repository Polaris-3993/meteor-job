import { VZ } from '/imports/startup/both/namespace';
import './profile-name.html';

Template.profileName.onCreated(function () {
    this.editName = new ReactiveVar(false);
});

Template.profileName.onRendered(function () {
});

Template.profileName.events({
    'click .edit-name': function (event, tmpl) {
        tmpl.editName.set(!tmpl.editName.get());
    },

    'input #firstNameEdit': function (event, tmpl) {
        var $field = tmpl.$('#firstNameEdit');
        var error = Template.signUpPage.validateName($field);
        if (error) {
            var $label = $field.closest('.input-field').find('label');
            $label.attr('data-error', error);
        }
    },

    'input #lastNameEdit': function (event, tmpl) {
        var $field = tmpl.$('#lastNameEdit');
        var error = Template.signUpPage.validateName($field);
        if (error) {
            var $label = $field.closest('.input-field').find('label');
            $label.attr('data-error', error);
        }
    },

    'submit #editNameForm': function (event, tmpl) {
        event.preventDefault();
        var firstName = tmpl.$('#firstNameEdit'),
            lastName = tmpl.$('#lastNameEdit'),
            error = null;
        error = Template.profileName.validateName(firstName);
        if (error) {
            $('.toast').hide();
            VZ.notify(error, 5000);
            return;
        }

        error = Template.profileName.validateName(lastName);
        if (error) {
            $('.toast').hide();
            VZ.notify(error, 5000);
            return;
        }

        if (_.isEmpty(firstName.val()) || _.isEmpty(lastName.val())) {
            $('.toast').hide();
            VZ.notify(error, 5000);
            return;
        }
        Meteor.call('editName', firstName.val(), lastName.val(), function (err) {
            if (err) {
                $('.toast').hide();
                Materialize.toast(err, 5000);
            }
        });


        tmpl.editName.set(false);
    }
});

Template.profileName.helpers({
    editName: function () {
        return Template.instance().editName.get();
    },

    firstName: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        return user.profile.firstName;
    },

    lastName: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        return user.profile.lastName;
    },

    profileName: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }

        var profile = user.profile,
            firstName = profile.firstName,
            lastName = profile.lastName;

        if (!firstName || !lastName || !_.isEmpty(firstName.trim()) || !_.isEmpty(lastName.trim()))
            return firstName + ' ' + lastName;
        else
            return 'Unnamed Capybara';
    },

    profileOwner: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if(user){
            return Meteor.userId() === user._id;
        }
        
        return false
    }
});


Template.profileName.validateName = function ($field) {
    if (!$field) return;
    var MAX_LENGTH = 15;

    var regexp = new RegExp(/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/),
        $label = $field.closest('.input-field').find('label');
    if ($field.val().length == 0) {
        $field.removeClass('invalid');
        $field.removeClass('valid');
        return;
    }

    if ($field.val().length > MAX_LENGTH) {
        $field.removeClass('valid');
        $field.addClass('invalid');
        return 'Too long name';
    }
    if (!regexp.test($field.val())) {
        $field.removeClass('valid');
        $field.addClass('invalid');
        return 'Invalid input';
    }

    $field.removeClass('invalid');
    $field.addClass('valid');
};