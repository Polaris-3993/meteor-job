import { Transactions } from '../transactions';
import { BankCredentials } from '/imports/api/bankCredentials/bankCredentials';

Meteor.publishComposite('allTransactionsWithUsersForAdmin', function (userId) {
    if(userId === 'wh8or4SeGKKr5WTDs' || this.userId) {
        return {
            find: function () {
                return Transactions.find();
            },
            children: [
                {
                    find: function (transaction) {
                        return BankCredentials.find({_id: transaction.bankAccountId});
                    }
                }
            ]
        }
    }
    else {
        return this.ready();
    }
});
Meteor.publishComposite('oneTransactionWithUsersForAdmin', function (id, userId) {
    if(userId === 'wh8or4SeGKKr5WTDs' || this.userId) {
        return {
            find: function () {
                return Transactions.find({_id: id});
            },
            children: [
                {
                    find: function (transaction) {
                        return BankCredentials.find({_id: transaction.bankAccountId});
                    }
                }
            ]
        }
    }
    else {
        return this.ready();
    }
});