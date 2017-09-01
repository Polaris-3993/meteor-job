// Methods to debug Mandrill
Meteor.methods({
    sendEmail: function (to, from, subject, text) {
        check([to, from, subject, text], [String]);

        // Let other method calls from the same client start running,
        // without waiting for the email sending to complete.
        this.unblock();

        //actual email sending method
        Email.send({
            to: to,
            from: from,
            subject: subject,
            text: text
        });
    },
    sendVerificationEmail: function (userId, email) {
        var response = {};

        if (email && userId) {

            Accounts.sendVerificationEmail(userId, email);
            response.success = true;
            return response;
        }
        else if (userId) {
            Accounts.sendVerificationEmail(userId);
            response.success = true;
            return response;
        }
        response.success = false;
        response.error = 'No user found';

        return response;
    }
});