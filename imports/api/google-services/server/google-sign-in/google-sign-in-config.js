var googleConfig = {

    service: 'google',
    clientId: Meteor.settings.GOOGLE.CLIENT_ID,
    secret: Meteor.settings.GOOGLE.SECRET
};


ServiceConfiguration.configurations.remove({
    service: 'google'
});

ServiceConfiguration.configurations.insert(googleConfig);
