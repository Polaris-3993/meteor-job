import { BankCredentials } from '../bankCredentials';

Meteor.publish('userBankCredentials', function (appUserId) {
    const userId = appUserId || this.userId;
    if (userId) {
        return BankCredentials.find({
            userId: userId
        });
    } else {
        return this.ready();
    }
});

Meteor.publish('allBankCredentials', function (appUserId) {
    const userId = appUserId || this.userId;
    if (userId) {
        return BankCredentials.find();
    } else {
        return this.ready();
    }
});

Meteor.publish('oneBankCredential', function (id, appUserId) {
    const userId = appUserId || this.userId;
    if (userId) {
        return BankCredentials.find({_id: id});
    } else {
        return this.ready();
    }
});