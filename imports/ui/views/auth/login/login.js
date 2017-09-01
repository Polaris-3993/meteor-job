import { VZ } from '/imports/startup/both/namespace';
import './login.html';

Template.loginPage.events({
  "click .btn": function(event, template) {
    var options = {
      requestPermissions: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
      ],
      loginStyle: "popup",
    };
    Meteor.loginWithGoogle(options, function(err) {
      if(err) {console.log("LOGIN=", err);
        VZ.notify(err.reason);
      } else {
        Router.go('home');
      }
    });
  }
});
