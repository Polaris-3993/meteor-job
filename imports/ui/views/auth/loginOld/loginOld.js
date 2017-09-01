import { VZ } from '/imports/startup/both/namespace';
import './loginOld.html';

Template.loginPageOld.onRendered(function () {
});

Template.loginPageOld.events({
    'submit form': function (event, tmpl) {
        event.preventDefault();

        var email = tmpl.$('#login-form input').val();
        var password = tmpl.$('#login-form input[type="password"]').val();
        
        if(email.trim().length <= 0 && password.trim().length <= 0){
            VZ.notify("All fields are required");
            return;
        }

        Meteor.loginWithPassword(email, password, function (error) {

            if (error) {
                console.log(error);
                VZ.notify("Incorect email or password", 5000);
            } else {
                Router.go('workplaces');
            }
        });
    }
});
