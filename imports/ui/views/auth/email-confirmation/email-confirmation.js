import { VZ } from '/imports/startup/both/namespace';
import './email-confirmation.html';

Template.emailConfirmation.helpers({
    "isDev": function () {
        return VZ.helpers.isDev();
    }
});

