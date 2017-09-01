import { Transactions } from './transactions';
import { Contracts } from '/imports/api/contracts/contracts';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { BankCredentials } from '/imports/api/bankCredentials/bankCredentials';

import {SyncedCron} from 'meteor/percolate:synced-cron';
Meteor.startup(function () {
// generateTransactions();
});
SyncedCron.add({
    name: 'Creating transactions for the last month',
    schedule: function (parser) {
        return parser.text('on the first day of the month at 00:00 am ');
        // return parser.text('every 1 mins');
    },
    job: function () {
        var lastMonth = getMonth();
        var start = lastMonth.startOfMonth;
        var end = lastMonth.endOfMonth;
        var monthName = lastMonth.monthName;
        var query = {status: 'active'};
        query.workerId = {$exists: true};

        var contracts = Contracts.find(query).fetch();
        for (var i = 0; i < contracts.length; i++) {
            var worker = Meteor.users.findOne({_id: contracts[i].workerId});
            var employer = Meteor.users.findOne({_id: contracts[i].employerId});

            var bankCredentials = BankCredentials.findOne({userId: contracts[i].workerId});

            var timeEntries = TimeEntries.find({
                contractId: contracts[i]._id,
                userId: contracts[i].workerId,
                startDate: {
                    $gte: start,
                    $lte: end
                }
            }).fetch();

            var money = getMoneyForEntries(timeEntries, end);
            var transaction = {
                workerId: worker._id,
                employerId: employer._id,
                paymentReference: monthName + ' salary',
                amountCurrency: 'USD',
                sourceCurrency: 'USD',
                amount: parseFloat(money.amount),
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            if (bankCredentials) {
                transaction.bankAccountId = bankCredentials._id;
            }
            Transactions.insert(transaction);
        }
    }
});

var generateTransactions = function () {
    var lastMonth = getMonth();
    var start = lastMonth.startOfMonth;
    var end = lastMonth.endOfMonth;
    var monthName = lastMonth.monthName;
    var query = {status: 'active'};
    query.workerId = {$exists: true};

    var contracts = Contracts.find(query).fetch();
    for (var i = 0; i < contracts.length; i++) {
        var worker = Meteor.users.findOne({_id: contracts[i].workerId});
        var employer = Meteor.users.findOne({_id: contracts[i].employerId});

        var bankCredentials = BankCredentials.findOne({userId: contracts[i].workerId});

        var timeEntries = TimeEntries.find({
            contractId: contracts[i]._id,
            userId: contracts[i].workerId,
            startDate: {
                $gte: start,
                $lte: end
            }
        }).fetch();

        var money = getMoneyForEntries(timeEntries, end);
        var transaction = {
            workerId: worker._id,
            employerId: employer._id,
            paymentReference: monthName + ' salary',
            amountCurrency: 'USD',
            sourceCurrency: 'USD',
            amount: parseFloat(money.amount),
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        if (bankCredentials) {
            transaction.bankAccountId = bankCredentials._id;
        }
        Transactions.insert(transaction);
    }
};

var getMonth = function () {
    var startOfMonth = moment().subtract(1, 'month').startOf('month').toDate();
    var endOfMonth = moment().subtract(1, 'month').endOf('month').toDate();
    var monthName = moment().subtract(1, 'month').format('MMMM');
    return {
        startOfMonth: startOfMonth,
        endOfMonth: endOfMonth,
        monthName: monthName
    }
};

var getMoneyForEntries = function (timeEntries, end) {
    var oneHour = 1000 * 60 * 60;
    var amount = 0;

    _.each(timeEntries, function (entry) {
        var timeEntryDuration = 0;
        if (entry.endDate) {
            timeEntryDuration = entry.endDate - entry.startDate;
        }
        else {
            timeEntryDuration = end - entry.startDate;
        }

        var earned = timeEntryDuration * entry.paymentRate / oneHour;
        amount += earned;
    });

    return {
        amount: amount.toFixed(2)
    }
};
