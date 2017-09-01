import { VZ } from '/imports/startup/both/namespace';

var routesForUnloggedUsers = [
    'login',
    'index',
    'sign-up',
    'password-reset',
    'screensaver',
    'email-confirmation',
    'profile-not-activated',
    'verify-email',
    'recover-password',
    'account-closed',

    'reset-db'
];

var isLoggedIn = function () {
    var user = Meteor.user();
    if (user && !Meteor.loggingIn()) {
        var emailVerified = VZ.helpers.isEmailVerified(user);
    }
    if (!user && !Meteor.loggingIn() && Router.current().route.getName() !== 'login-old') {
        Router.go('login');
    }
    else if(Router.current().route.getName() === 'login-old') {
        // Router.go('login-old');
        this.next();
    }
    else if (!emailVerified && !Meteor.loggingIn()) {
        Router.go('profile-not-activated')
    }
    else if (user && user.status === 'closed') {
        Accounts.logout();
        Router.go('account-closed');
    }
    else {
        this.next();
    }
};
Router.onBeforeAction(isLoggedIn, {
    except: routesForUnloggedUsers
});
