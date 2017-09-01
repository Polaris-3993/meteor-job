import { VZ } from '/imports/startup/both/namespace';
import './dev-buttons.html';

Template.devButtons.events({

    'click #confirm-email': function () {

        var verified = Meteor.call('confirmEmail', Meteor.userId(), handleConfirmResponse);

        function handleConfirmResponse(err, verified) {
            if (verified) {

                VZ.notify('Successfully verified', 5000);
                Router.go('workplaces');

            }
            else {

                VZ.notify('Error. Not verified', 5000);

            }
        }

    },
    'click #send-confirmation-email': function () {

        var emailSent = Meteor.call('sendVerificationEmail', Meteor.userId(), handleResponse);

        function handleResponse(err, emailSent) {

            if (emailSent) {

                VZ.notify('Email sent', 5000);

            }
            else {
                if (!err.reason)
                    VZ.notify('Error. Something went wrong..', 5000);
                else
                    VZ.notify(err.reason, 5000);
            }
        }


    }
});