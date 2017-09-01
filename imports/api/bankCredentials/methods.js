import { BankCredentials } from './bankCredentials';
import { Transactions } from '/imports/api/transactions/transactions';

Meteor.methods({
    addBankAccount: function (bankData) {
        check(bankData, Object);
        var userId = this.userId;
        if (userId) {
            var user = Meteor.users.findOne({_id: userId});
            var recipientEmail = user.emails[0].address;
            bankData = _.extend(bankData, {
                userId: userId,
                recipientEmail: recipientEmail,
                accountType: 'checking',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            var id = BankCredentials.insert(bankData);
            Transactions.update({workerId: userId}, {$set: {bankAccountId: id}});
            return id;
        }
    },
    updateBankAccount: function (bankData) {
        check(bankData, Object);
        var userId = this.userId;
        if (userId) {
            var bankAccount = BankCredentials.findOne({_id: bankData._id});
            if (bankAccount) {
                bankData.updatedAt = new Date();
                BankCredentials.update({_id: bankAccount._id}, {$set: bankData});
                Transactions.update({workerId: userId}, {$set: {bankAccountId: bankAccount._id}});
            }
            else {
                throw new Meteor.Error('Bank account not found');
            }
        }
    }
});