import { VZ } from '/imports/startup/both/namespace';
import './password-reset.html';

Template.passwordReset.onRendered(function () {
    this.busy = false;
});

Template.passwordReset.events({
    'submit form': function (event, tmpl) {
        event.preventDefault();

        var busy = tmpl.busy;


        if (!busy) {

            var email = $('#login-form input[type="email"]').val();

            console.log('email : ', email);

            var options = {
                email: email
            };

            Template.instance().busy = true;
            Accounts.forgotPassword(options, function (error) {
                tmpl.busy = true;
                if (error) {
                    VZ.notify('Ups..' + error.reason, 5000);
                }
                else {
                    VZ.notify('Email has been sent', 5000);
                    Router.go('login');
                }
            });
        }
        else {

            VZ.notify("Don't be so annoying", 5000);

        }
    }
});
