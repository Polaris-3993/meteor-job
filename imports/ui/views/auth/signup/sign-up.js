import { VZ } from '/imports/startup/both/namespace';
import './sign-up.html';

Template.signUpPage.onCreated(function () {
    var self = this;
    this.signUpWithPassword = function () {
        var email = self.$('#login-form input[type="email"]').val(),
            password = self.$('#login-form input[type="password"]').val(),
            firstName = self.$('#login-form #first_name').val() || '',
            lastName = self.$('#login-form #last_name').val() || '',
            fullName = firstName + ' ' + lastName;

        var userId = Accounts.createUser({
            email: email,
            password: password,
            profile: {
                firstName: firstName,
                lastName: lastName,
                fullName: fullName
            }
        }, function (error) {
            if (error) {
                VZ.notify(error.reason, 5000);
            } else {
                Router.go('email-confirmation')
            }
        });
    }
});

Template.signUpPage.events({
    'submit #login-form': function (event, tmpl) {
        event.preventDefault();

        var error = Template.signUpPage.allFieldsAreNotValid();
        if (error) {
            $('.toast').hide();
            VZ.notify(error);
            return;
        }

        var email = tmpl.$('#login-form input[type="email"]').val();

        var isGoogleAccount = /\@gmail.com$/.test(email);
        if (isGoogleAccount) {
            $('#google-proposal-modal').modal();
            $('#google-proposal-modal').modal('open');
        } else {
            tmpl.signUpWithPassword();
        }
    },

    'click #google-proposal-yes': function () {
        Meteor.loginWithGoogle({requestPermissions: ['email', 'profile']});
    },
    'click #google-proposal-no': function (event, tmpl) {
        tmpl.signUpWithPassword();
    },

    'blur .input-field': function (event) {
        var $input = $(event.target);
        var fieldId = $input.attr('id');
        var error;

        switch (fieldId) {
            case 'first_name':
            case 'last_name':
                error = Template.signUpPage.validateName($input);
                break;
            case 'password':
                error = Template.signUpPage.validatePassword($input);
                break;
            case 'email':
                error = Template.signUpPage.validateEmail($input);
                break;
        }
        var $label = $input.next();
        $label.attr('data-error', error);
    }
});


Template.signUpPage.validateName = function ($input) {
    if (!$input) {
        return false;
    }
    var MAX_LENGTH = 15;

    var regexp = new RegExp(/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/);

    if ($input.val().length == 0) {
        $input.removeClass('invalid');
        $input.removeClass('valid');
        return;
    }
    if ($input.val().length > MAX_LENGTH) {
        $input.removeClass('valid');
        $input.addClass('invalid');
        return 'Too long name';
    }
    if (!regexp.test($input.val())) {
        $input.removeClass('valid');
        $input.addClass('invalid');
        return 'Invalid input';
    }

    $input.removeClass('invalid');
    $input.addClass('valid');
    return false;
};

Template.signUpPage.validateEmail = function ($input) {
    if (!$input) {
        return false;
    }

    var regexp = new RegExp(/^(([^<>()[\]\\.,;:\s@\']+(\.[^<>()[\]\\.,;:\s@\']+)*)|(\'.+\'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

    if ($input.val().length == 0) {
        $input.removeClass('invalid');
        $input.removeClass('valid');
        return 'Email may not be empty';
    }
    if (!regexp.test($input.val())) {
        $input.removeClass('valid');
        $input.addClass('invalid');
        return 'Invalid email';
    }
    if ($input.val().length == 0) {
        $input.addClass('invalid');
        $input.removeClass('valid');
        return 'Invalid email';
    }
    $input.removeClass('invalid');
    $input.addClass('valid');

    return false;
};

Template.signUpPage.validatePassword = function ($input) {
    if (!$input) {
        return false;
    }

    var MAX_LENGTH = 100,
        MIN_LENGTH = 8;
    var regexp = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/);

    if ($input.val().length < MIN_LENGTH) {
        $input.removeClass('valid');
        $input.addClass('invalid');
        return 'Password is too short';
    }
    if ($input.val().length > MAX_LENGTH) {
        // $label.attr('data-error', 'Max length is 100');
        $input.removeClass('valid');
        $input.addClass('invalid');
        return 'Max length is 100';
    }

    if (!regexp.test($input.val())) {
        $input.removeClass('valid');
        $input.addClass('invalid');
        return 'Password should contain at least one capital letter and number';
    }
    $input.removeClass('invalid');
    $input.addClass('valid');

    return false;
};

Template.signUpPage.allFieldsAreNotValid = function () {
    var firstNameField = $('#first_name'),
        lastNameField = $('#last_name'),
        passwordField = $('#password'),
        emailField = $('#email');

    var error = Template.signUpPage.validateEmail(emailField);
    if (error) return error

    error = Template.signUpPage.validatePassword(passwordField);
    if (error) return error;

    error = Template.signUpPage.validateName(firstNameField);
    if (error) return error;

    error = Template.signUpPage.validateName(lastNameField);
    if (error) return error;

    return false;
};

