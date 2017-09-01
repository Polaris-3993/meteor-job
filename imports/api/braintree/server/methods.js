//package/braintree
import { BankCredentials } from '/imports/api/bankCredentials/bankCredentials';
import braintree from 'braintree';
import { Meteor } from 'meteor/meteor';
var gateway;

Meteor.startup(function () {
    gateway = braintree.connect({
        environment: braintree.Environment.Sandbox,
        publicKey: Meteor.settings.private.BT_PUBLIC_KEY,
        privateKey: Meteor.settings.private.BT_PRIVATE_KEY,
        merchantId: Meteor.settings.private.BT_MERCHANT_ID
    });
});


Meteor.methods({
    getClientToken: function (clientId) {
        var generateToken = Meteor.wrapAsync(gateway.clientToken.generate, gateway.clientToken);
        var options = {};
        if (clientId) {
            options.clientId = clientId;
        }
        var response = generateToken(options);
        return response.clientToken;
    },
    createTransaction: function (data) {
        var transaction = Meteor.wrapAsync(gateway.transaction.sale, gateway.transaction);
        // this is very naive, do not do this in production!
        var amount = 20;
        var response = transaction({
            amount: amount,
            paymentMethodNonce: data.nonce,
            customer: {
                firstName: data.firstName
            }
        });
        return response;
    },
    createCustomer: function () {
        var user = Meteor.users.findOne({_id: this.userId});
        if (user && !user.profile.billing) {
            var customer = Meteor.wrapAsync(gateway.customer.create, gateway.customer);
            var response = customer({
                firstName: user.profile.firstName,
                lastName: user.profile.lastName,
                email: user.emails[0].address,
            });
            Meteor.users.update({_id: this.userId}, {$set: {'profile.billing.customerId': response.customer.id}});
            return response;
        }

    },
    checkIfCustomer: function () {
        var userId = this.userId;
        var user = Meteor.users.findOne({_id: this.userId});
        var customer = Meteor.wrapAsync(gateway.customer.find, gateway.customer);
        var newCustomer = Meteor.wrapAsync(gateway.customer.create, gateway.customer);
        try {
            customer(userId);
        }
        catch (err) {
            if (err.name == 'notFoundError') {
                var responseCustomer = newCustomer({
                    id: userId,
                    firstName: user.profile.firstName,
                    lastName: user.profile.lastName,
                    email: user.emails[0].address,
                });
            }
        }

        return responseCustomer;
    },
    deleteCustomer: function () {
        var user = Meteor.users.findOne({_id: this.userId});
        if (user) {
            var customer = Meteor.wrapAsync(gateway.customer.delete, gateway.customer);
            var response = customer('55425400');
            return response;
        }
    },
    updateCustomer: function () {
        var user = Meteor.users.findOne({_id: this.userId});
        if (user) {
            var customer = Meteor.wrapAsync(gateway.customer.delete, gateway.customer);
            var response = customer('55425400');
            return response;
        }
    },
    getCustomerInfo: function () {
        var userId = this.userId;
        if (userId) {
            var customer = Meteor.wrapAsync(gateway.customer.find, gateway.customer);
            var response = customer(userId);
            return response;
        }
    },
    createPaymentMethod: function (nonceFromTheClient) {
        var userId = this.userId;
        if (userId) {
            var customer = Meteor.wrapAsync(gateway.paymentMethod.create, gateway.paymentMethod);
            var response = customer({
                customerId: userId,
                paymentMethodNonce: nonceFromTheClient,
                options: {
                    verifyCard: true,
                    makeDefault: true
                }
            });
        }
    },
    updatePaymentMethod: function (nonceFromTheClient, customerInfo) {
        var userId = this.userId;
        var user = Meteor.users.findOne({_id: userId});
        if (user) {
            var paymentMethod = customerInfo && customerInfo.paymentMethods && customerInfo.paymentMethods[0] && customerInfo.paymentMethods[0].token;
            if (paymentMethod) {
                var customer = Meteor.wrapAsync(gateway.paymentMethod.update, gateway.paymentMethod);
                var response = customer(paymentMethod, {
                    customerId: userId,
                    paymentMethodNonce: nonceFromTheClient,
                    options: {
                        verifyCard: true,
                        makeDefault: true
                    }
                });
                return response;
            }
            else {
                Meteor.call('createPaymentMethod', nonceFromTheClient);
            }
        }
    },
    deletePaymentMethod: function (token) {
        var user = Meteor.users.findOne({_id: this.userId});
        if (user) {
            var customer = Meteor.wrapAsync(gateway.paymentMethod.delete, gateway.paymentMethod);
            var response = customer(token);
            Meteor.users.update({_id: this.userId}, {$pull: {'profile.billing.paymentMethods': token}});

            return response;
        }
    },
    findTransactions: function () {
        var userId = this.userId;
        if (userId) {
            var transactions = Meteor.wrapAsync(gateway.transaction.search, gateway.transaction);
            var searchFunction = function (search) {
                search.customerId().is(userId);
            };
            var iterateFunction = function (err, response) {
                response.each(function (err, transaction) {
                    // Session.set('transaction', transaction);
                    console.log(transaction.amount);
                });
            };
           var stream =  transactions(searchFunction);
            var completeData = "";
            stream.on("data", function(chunk){
                completeData += JSON.stringify(chunk);
            });
            stream.on("end", function(){
                // console.log(completeData);
            });

            // stream.resume();
            return [];
        }
    },
    findPaymentMethods: function (paymentMethods) {
        var methods = [];
        for (var i = 0; i < paymentMethods.length; i++) {
            var customer = Meteor.wrapAsync(gateway.paymentMethod.find, gateway.paymentMethod);
            var response = customer(paymentMethods[i]);
            methods.push(response);
        }
        return methods;
    },
    findPaymentMethod: function (token) {
        var customer = Meteor.wrapAsync(gateway.paymentMethod.find, gateway.paymentMethod);
        var response = customer(token);
        return response;
    },
    getPlans: function () {
        var plan = Meteor.wrapAsync(gateway.plan.all, gateway.plan);
        var response = plan();
        return response;
    },
    subscribeToPlan: function (token, maskedNumber) {
        var subscriptionId = Meteor.wrapAsync(gateway.subscription.create, gateway.subscription);
        var response = subscriptionId({
            paymentMethodToken: token,
            planId: 'vezio-pro'
        });
        var paymentMethod = token;
        var id = response.subscription.id;
        var isActive = response.subscription.status;
        var nextBillingDate = response.subscription.nextBillingDate;
        var subscription = {
            id: id,
            isActive: isActive,
            nextBillingDate: nextBillingDate,
            planId: 'vezio-pro',
            paymentMethod: paymentMethod,
            maskedNumber: maskedNumber

        };
        Meteor.users.update({_id: this.userId}, {$addToSet: {'profile.billing.subscriptions': subscription}});
        return response;
    },
    unSubscribeToPlan: function (subscriptionId) {
        var subscription = Meteor.wrapAsync(gateway.subscription.cancel, gateway.subscription);
        var response = subscription(subscriptionId);

        Meteor.users.update({_id: this.userId}, {$pull: {'profile.billing.subscriptions': {id: subscriptionId}}});
        return response;
    },
    changeSubPaymentMethod: function (subscriptionId, paymentMethodToken, maskedNumber) {
        var user = Meteor.users.findOne({_id: this.userId});
        var subscribtions = user.profile.billing.subscriptions;
        for (var i = 0; i < subscribtions.length; i++) {
            if (subscribtions[i].id == subscriptionId) {
                subscribtions[i].paymentMethod = paymentMethodToken;
                subscribtions[i].maskedNumber = maskedNumber;
            }
        }
        var subscription = Meteor.wrapAsync(gateway.subscription.update, gateway.subscription);
        var response = subscription(subscriptionId, {
            paymentMethodToken: paymentMethodToken
        });
        Meteor.users.update({
            _id: this.userId,
            'profile.billing.subscriptions': {$elemMatch: {id: subscriptionId}}
        }, {$set: {'profile.billing.subscriptions': subscribtions}});
        return response;
    },
    submitForSettlement: function (paymentMethodToken) {
        var submitSettlement = Meteor.wrapAsync(gateway.transaction.sale, gateway.transaction);

        var settlement = submitSettlement({
            amount: '100.00',
            paymentMethodToken: paymentMethodToken,
            options: {
                submitForSettlement: true
            }
        });
        return settlement;
    }
});