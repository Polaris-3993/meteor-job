import { VZ } from '/imports/startup/both/namespace';
import braintree from 'braintree-web/client';
import hostedFields from 'braintree-web/hosted-fields';
import { BankCredentials } from '/imports/api/bankCredentials/bankCredentials';
import './billing.html';
import './change-credit-card-modal/change-credit-card-modal';
import './create-edit-bank-credentials-modal/create-edit-credentials-modal';
import './invoices-modal/invoices-modal';

Template.billingSettings.onCreated(function () {
    var self = this;
    this.customerInfo = new ReactiveVar({});
    this.plans = new ReactiveVar({});
    this.transactions = new ReactiveVar([]);

    var user = Meteor.users.findOne({_id: Meteor.userId()});
        Meteor.call('checkIfCustomer', function (error, result) {
            if (error) {
                VZ.notify(error.message);
            }
        });


    this.updateCustomerInfo = function () {
        Meteor.call('getCustomerInfo', function (error, result) {
            if (!error) {
                self.customerInfo.set(result);
            }
            else {
                VZ.notify(error.message);
            }
        });
    };
    this.getPlans = function () {
        Meteor.call('getPlans', function (error, result) {
            if(!error){
                self.plans.set(result);
            }
            else {
                VZ.notify('Fail to load plans');
            }
        });
    };
    this.findTransactions = function () {
        console.log('qwe');

        Meteor.call('findTransactions', function (error, result) {
            if (!error) {
                // console.log(Session.get('transaction'));
                console.log(result);
                // self.transactions.set(result);
            }
            else {
                VZ.notify(error.message);
            }
        });
    };
    this.autorun(function () {
            self.updateCustomerInfo();
            self.getPlans();
            // self.findTransactions();
    });
    this.autorun(function () {
        Template.currentData();
       self.subscribe('userBankCredentials');
    });
});
Template.billingSettings.onRendered(function () {

});

Template.billingSettings.helpers({
    customer: function () {
        var customer = Template.instance().customerInfo.get();
        return customer ;
    },
    isSubscribed: function () {
        var user = Meteor.users.findOne({_id: Meteor.userId()});
        var subscription = user && user.profile && user.profile.billing && user.profile.billing.subscriptions && user.profile.billing.subscriptions[0] && user.profile.billing.subscriptions[0].id;
        return subscription;
    },
    last4: function () {
        var last4 = this && this.paymentMethods && this.paymentMethods[0] && this.paymentMethods[0].last4;
        return last4;
    },
    isPaymentMethod: function () {
        var customer = Template.instance().customerInfo.get();
        return customer && customer.paymentMethods && customer.paymentMethods[0];
    }
});
Template.billingSettings.events({
    'click #change-card': function (event, tmpl) {
        event.preventDefault();
        var user = Meteor.users.findOne({_id: Meteor.userId()});
        if (!user || !user.profile) {
            return;
        }

        var customer = tmpl.customerInfo.get();
        var parentNode = $('body')[0],
            onCardChange = function (user) {
            tmpl.updateCustomerInfo();
            },
            modalData = {
                customer: customer,
                onCardChange: onCardChange
            };
        Blaze.renderWithData(Template.changeCreditCardModal, modalData, parentNode);
    },
    'click #upgrade-to-plan': function (event, tmpl) {
        event.preventDefault();
        var customerInfo = tmpl.customerInfo.get();
        var paymentMethod = customerInfo && customerInfo.paymentMethods && customerInfo.paymentMethods[0];
        if(paymentMethod){
            var token = paymentMethod.token;
            var maskedNumber = paymentMethod.maskedNumber;
            Meteor.call('subscribeToPlan', token, maskedNumber, function (error, result) {
                if (result){
                    VZ.notify('Subscription successful');
                }
                else {
                    VZ.notify(error.message);
                }
            });
        }
        else {
            VZ.notify('Add card');
        }
    },
    'click #downgrade-to-plan': function (event, tmpl) {
        event.preventDefault();
        var user = Meteor.users.findOne({_id: Meteor.userId()});
        var planId = 'vezio-pro';
        var subscribtion =  _.find(user.profile.billing.subscriptions, function(subscription){return subscription.planId == planId; });
        var subscribtionId = subscribtion.id;
        if(subscribtionId){
            Meteor.call('unSubscribeToPlan', subscribtionId, function (error, result) {
                if(!error){
                    VZ.notify('Unsubscribed');
                    tmpl.updateCustomerInfo();
                    tmpl.getPlans();
                }
                else {
                    VZ.notify(error.message);
                }
            });
        }
    },
    'click #generate-invoice': function (event, tmpl) {
        event.preventDefault();
        var parentNode = $('body')[0],
            modalData = {};
        Blaze.renderWithData(Template.invoicesModal, modalData, parentNode);
    },
    'click #add-credentials': function (event, tmpl) {
        event.preventDefault();
        var bankCredentials = BankCredentials.findOne({userId: Meteor.userId()});
        var parentNode = $('body')[0],
            modalData = {bankCredentials: bankCredentials};
        Blaze.renderWithData(Template.createEditCredentialsModal, modalData, parentNode);
    }
});