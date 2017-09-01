import { VZ } from '/imports/startup/both/namespace';
import './change-password.html';

Template.changePassword.events({
    'submit #changePasswordForm': function (event) {
        e.preventDefault();
        var changePasswordForm = $(event.currentTarget),
            oldPassword = changePasswordForm.find('#oldPassword').val(),
            newPassword = changePasswordForm.find('#password').val(),
            passwordConfirm = changePasswordForm.find('#confirmPassword').val();


        if (_.isEmpty(passwordConfirm) || _.isEmpty(newPassword) || _.isEmpty(oldPassword)) {

            VZ.notify('Password may not be empty', 5000);
            return;
        }

        var validationResult = VZ.helpers.validatePassword(newPassword);

        if (validationResult.error) {

            VZ.notify(validationResult.msg, 5000);
            return;
        }

        if (oldPassword === newPassword) {

            VZ.notify('New password must not be same as existing password', 5000);
            return;
        }

        if (newPassword != passwordConfirm) {

            VZ.notify("Passwords don't match'", 5000);
            return;
        }

        var options = {
            logout: false
        };
        Accounts.changePassword(oldPassword, newPassword, function (err) {
            if (err) {

                VZ.notify(err.reason, 5000);
                console.log(err.reason);
            }
            else {

                VZ.notify('Your password has been changed.', 5000)
                Router.go('profile');
            }
        });
    },

    'input .input-field #oldPassword': function (event, tmpl) {
        var $field = tmpl.$('#oldPassword'),
            password = $field.val(),
            validationResult = VZ.helpers.validatePassword(password);

        if (validationResult.error) {
            var $label = $field.closest('.input-field').find('label');
            $label.attr('data-error', validationResult.msg);

            $field.addClass('invalid');
            $field.removeClass('valid');
        }
        else {
            $field.addClass('valid');
            $field.removeClass('invalid');
        }
    },

    'input .input-field #password': function (event, tmpl) {
        var $field = tmpl.$('#password'),
            password = $field.val(),
            validationResult = VZ.helpers.validatePassword(password);

        if (validationResult.error) {
            var $label = $field.closest('.input-field').find('label');
            $label.attr('data-error', validationResult.msg);

            $field.addClass('invalid');
            $field.removeClass('valid');
        }
        else {
            $field.addClass('valid');
            $field.removeClass('invalid');
        }
    },

    'input .input-field #confirmPassword': function (event, tmpl) {
        var $field = tmpl.$('#confirmPassword'),
            $passwordField = tmpl.$('#password'),
            password = $passwordField.val(),
            confirmPassword = $field.val(),
            validationResult = VZ.helpers.matchPasswords(password, confirmPassword);

        if (validationResult.error) {
            var $label = $field.closest('.input-field').find('label');
            $label.attr('data-error', validationResult.msg);

            $field.addClass('invalid');
            $field.removeClass('valid');
        }
        else {
            $field.addClass('valid');
            $field.removeClass('invalid');
        }
    }
});