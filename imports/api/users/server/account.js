Meteor.startup(configConfirmMailService);


import { BankCredentials } from '/imports/api/bankCredentials/bankCredentials';
import { VZ } from '/imports/startup/both/namespace';


function configConfirmMailService() {

    Accounts.emailTemplates.from = 'Vezio Notification <' + Meteor.settings.mandrill.sender.email + '>';
    Accounts.emailTemplates.siteName = 'Vezio';
    Accounts.emailTemplates.verifyEmail.subject = confirmEmailSubject;
    Accounts.emailTemplates.verifyEmail.html = renderMandrillTemplate;


    function confirmEmailFrom() {
        var email = Meteor.settings.mandrill.sender.email;
        var title = 'Vezio Notification';
        console.log(title + ' <' + email + '>')
        return title + ' <' + email + '>';
    }

    function confirmEmailSubject() {
        return 'Confirm Your Email Address for vezio';
    }


    function confirmEmailHTML(user, url) {
        var name = ''
        if (user.profile && user.firstname)
            name = user.firstname

        return 'Hello and welcome ' + name + ',\n' +
            'Thank you for registering with vezio - virtual workplace for distributed teams. <br>' +
            'To confirm your registration, click on the link below. The link is valid upto 3 days.' +
            'In the event you are unable to confirm your registration within the specified period, do not hesitate to write to us. \n\n' + +url +
            '\n\n For any questions related to vezio services, please submit your request here <br>' +
            'Look forward to serving your business needs.<br>' +
            'Thank you,<br>' +
            'Vezio team.<br>' +
            'http://www.vez.io/<br>'
    }

    function renderMandrillTemplate(user, url) {
        var name = ''
        if (user.profile && user.firstname)
            name = user.firstname
        var result;
        // need to replace # from standart meteor accounts link because we use custom route for email verification
        var link = url.replace('#/', '')
        try {
            result = Mandrill.templates.render({
                template_name: 'verify-email',
                template_content: [],
                merge_vars: [{
                    name: 'LINK',
                    content: link
                }, {
                    name: 'NAME',
                    content: name
                }]

            });
        } catch (error) {
            console.error('Error while rendering Mandrill template', error);
        }
        return result.data.html;
    }

    if (VZ.helpers.isDev()) {

        Accounts.config({

            sendVerificationEmail: false

        });
    }
    else {

        Accounts.config({

            sendVerificationEmail: true

        });
    }
}

Meteor.startup(configResetPasswordService);


function configResetPasswordService() {

    Accounts.emailTemplates.resetPassword.subject = resetPasswordSubject;
    Accounts.emailTemplates.resetPassword.html = renderMandrillTemplate;


    function resetPasswordSubject() {
        return 'vezio - Account password change';
    }

    function renderMandrillTemplate(user, url) {
        var name = '';
        if (user.profile && user.firstname)
            name = user.firstname
        var result;
        // need to replace # from standart meteor accounts link because we use custom route for email verification
        var tokenRegExp = /reset-password\/(.+)/g;
        var token = tokenRegExp.exec(url)[1];
        var link = Router.url('recover-password', {token: token});
        console.log(link);
        return false;
        try {
            result = Mandrill.templates.render({
                template_name: 'forgot-password',
                template_content: [],
                merge_vars: [{
                    name: 'LINK',
                    content: link
                }, {
                    name: 'NAME',
                    content: name
                }]

            });
        } catch (error) {
            console.error('Error while rendering Mandrill template', error);
        }
        return result.data.html;
    }
}

import { TimeEntries } from '/imports/api/timeEntries/timeEntries';

Meteor.startup(stopTrackingOnLogout);

function stopTrackingOnLogout() {
    if (Meteor.isServer) {
        Meteor.users.find({'status.online': true }).observe({
            removed: function(user) {
                // console.log('removed');
                // var timeEntry = TimeEntries.findOne({userId: user._id, _isActive: true});
                // var timeEntryId = timeEntry && timeEntry._id || '';
                // if(timeEntryId){
                //     var isTrackedByApp = timeEntry._trackedByDesktopApp;
                //     if(!isTrackedByApp){
                //         VZ.TimeTracker.instance.stopTracking();
                //     }
                // }
                Meteor.call('setTimeLogout', user);
            }
        });
        UserStatus.events.on('connectionLogout', function (fields) {
        });
    }
}

Accounts.onCreateUser(function (options, user) {
    if (user.services.google) {
        console.log('sign up with google');

        var rawProfile = user.services.google;

        user.emails = [{
            address: user.services.google.email,
            verified: true
        }];
        user.profile = {
            fullName: rawProfile.name || '',
            firstName: rawProfile.given_name || '',
            lastName: rawProfile.family_name || '',
            gender: rawProfile.gender || ''
        };

        var photoUrl = rawProfile.picture || '/images/default-lockout.png';
        user.profile.photo = {
            large: photoUrl,
            small: photoUrl
        }

    } else if (user.services.password) {
        console.log('sign up with pass');
        user.profile = options.profile || {};
    }

    check(user, Schemas.User);
    return user;
});

// add default role
Meteor.users.after.insert(function (userId, user) {
    Roles.addUsersToRoles(user._id, 'user', Roles.GLOBAL_GROUP);
});
