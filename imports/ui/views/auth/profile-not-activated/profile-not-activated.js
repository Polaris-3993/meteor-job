import { VZ } from '/imports/startup/both/namespace';
import './profile-not-activated.html';

Template.profileNotActivated.events({
    'click .log-out': function () {
        Meteor.logout();
        Router.go('login');
    },
    'click #resend-code': function () {
        var emailSent = Meteor.call('sendVerificationEmail', Meteor.userId(), handleResponse);

        function handleResponse(err, emailSent) {

            if (err) {

                VZ.notify(err.reason || 'Error. Something went wrong..', 5000);
            }

            else if (emailSent.success) {

                VZ.notify('Email sent', 5000);
                Router.go('email-confirmation');
            }
            else
                VZ.notify(emailSent.error || 'Something went wrong. Contact support', 5000);

        }
    }
});

Template.profileNotActivated.helpers({

    'isDev': function () {
        return VZ.helpers.isDev();
    }

});