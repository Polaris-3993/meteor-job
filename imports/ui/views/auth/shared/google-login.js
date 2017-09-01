import { VZ } from '/imports/startup/both/namespace';
import './google-login.html';

Template.googleLogin.events({
    'click #btn-google-login': function () {
        Meteor.loginWithGoogle({requestPermissions: ['email', 'profile']}, function (err) {
            if (err) {
                VZ.notify(err.reason);
            } else {
                Router.go('home');
            }
        });
    }
});