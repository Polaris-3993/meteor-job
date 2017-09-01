import { VZ } from '/imports/startup/both/namespace';

Router.map(function () {
    this.route('login', {
        path: '/login',
        layoutTemplate: 'voidLayout',
        template: 'loginPage'
    });
    this.route('login-old', {
        path: '/login-old',
        layoutTemplate: 'authLayout',
        template: 'loginPageOld'
    });
    this.route('home', {
        path: '/',
        action: function () {
            Router.go('dashboard');
        }
    });
    this.route('sign-up', {
        path: '/sign-up',
        layoutTemplate: 'authLayout',
        action: function () {
            this.render('signUpPage');
        }
    });
    this.route('password-reset', {
        path: '/password-reset',
        layoutTemplate: 'authLayout',
        template: 'passwordReset'
    });
    this.route('screensaver', {
        path: '/screensaver',
        layoutTemplate: 'authLayout',
        template: 'screensaver'
    });
    this.route('email-confirmation', {
        path: '/email-confirmation',
        layoutTemplate: 'authLayout',
        template: 'emailConfirmation'
    });
    this.route('profile-not-activated', {
        path: '/profile-not-activated',
        layoutTemplate: 'authLayout',
        template: 'profileNotActivated',
        onBeforeAction: function () {
            var user = Meteor.user();
            if (user.emails[0].verified) {
                Router.go('home');
            } else {
                this.next();
            }
        }
    });
    this.route('not-found', {
        path: '/not-found',
        layoutTemplate: 'notFoundLayout',
        template: 'notFound'
    });
    this.route('verify-email', {
        path: '/verify-email/:token',
        action: function () {
            var token = this.params.token;

            Accounts.verifyEmail(token, function (error) {
                if (error) {
                    console.error(error);
                    VZ.notify(error, 5000)
                    // redirect to error page
                } else {
                    console.log('Email verified');
                    // redirect to email verified page
                    VZ.notify('Your email is successfully verified!', 5000);
                    Router.go('workplaces')
                }
            })
        }
    });
    this.route('recover-password', {
        path: '/reset-password/:token',
        layoutTemplate: 'authLayout',
        template: 'recoverPassword',
        data: function () {
            var token = this.params.token;
            return {token: token};
        }
    });
    this.route('changePassword', {
        path: '/profile/change-password',
        layoutTemplate: 'mainLayout',
        template: 'changePassword',
        data: function () {
            return {
                pageTitle: 'Change password'
            }
        }
    });

    this.route('loading', {   //TEMP ROUTE FOR VIEWING LOADER
        path: '/loading',
        template: 'loading'
    })

});
