Meteor.startup(configEmailService);


function configEmailService() {

    Mandrill.config({
        username: Meteor.settings.mandrill.sender.email,
        key: Meteor.settings.mandrill.apiKey,
        host: 'smtp.mandrillapp.com',
        port: '587',
    });

    var smtp = {
        username: 'no-reply@vez.io',
        password: 'Urb5E4lhRMZr2xG8cu1GNg',
        server: 'smtp.mandrillapp.com',
        port: 587
    };
    process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) +
        ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server)
        + ':' + smtp.port;
}

