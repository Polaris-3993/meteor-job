export const GoogleApi = function () {
    var privateInfo = Meteor.settings.private.GOOGLE;
    var jwtClient = new googleapis.auth.JWT(privateInfo.client_email, null, privateInfo.private_key, privateInfo.scope, null);
    var authorize = Meteor.wrapAsync(jwtClient.authorize, jwtClient);
    var self = this;

    try {
        var tokens = authorize();

        self.token = tokens.access_token;
        console.log('Authorized with google. Token:', tokens.access_token);
    } catch (err) {
        console.log('Google auth error:', err);
        return;
    }
};