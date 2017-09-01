import { VZ } from '/imports/startup/both/namespace';
import braintree from 'braintree-web/client';
import hostedFields from 'braintree-web/hosted-fields';


import './billing-pay-methods.html';
Template.billingPayMethods.onCreated(function () {
    var self = this;
    this.customerInfo = new ReactiveVar({});
    this.plans = new ReactiveVar({});
    this.isSelectingMethod = new ReactiveVar(false);
    this.paymentMethod = new ReactiveVar({});
    var user = Meteor.users.findOne({_id: Meteor.userId()});
    var userBilling = user.profile.billing;
    if (!userBilling) {
        Meteor.call('createCustomer', function (error, result) {
            if (!error) {
                console.log(result);
            }
            else {
                VZ.notify(error.message);
            }
        });
    }
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
this.getPalns = function () {
    Meteor.call('getPlans', function (error, result) {
        if(!error){
            self.plans.set(result);
        }
        else {
            VZ.notify('Fail to load plans');
        }
    });
};
    this.autorun(function () {
        if (user.profile.billing) {
            self.updateCustomerInfo();
            self.getPalns();
        }
    });
});
Template.billingPayMethods.onRendered(function () {
    var self = this;
    Meteor.call('getClientToken', function (err, clientToken) {
        if (err) {
            console.log('There was an error', err);
            return;
        }
        var add = document.querySelector('#add-card');
        // var submit = document.querySelector('input[type="submit"]');

        braintree.create({
            // Replace this with your own authorization.
            authorization: clientToken,
        }, function (clientErr, clientInstance) {
            if (clientErr) {
                // Handle error in client creation
                return;
            }
            hostedFields.create({
                client: clientInstance,
                styles: {
                    'input': {
                        'font-size': '14pt'
                    },
                    'input.invalid': {
                        'color': 'red'
                    },
                    'input.valid': {
                        'color': 'green'
                    }
                },
                fields: {
                    number: {
                        selector: '#card-number',
                        placeholder: '4111 1111 1111 1111'
                    },
                    cvv: {
                        selector: '#cvv',
                        placeholder: '123'
                    },
                    expirationDate: {
                        selector: '#expiration-date',
                        placeholder: '10/2019'
                    }
                }
            }, function (hostedFieldsErr, hostedFieldsInstance) {
                if (hostedFieldsErr) {
                    // Handle error in Hosted Fields creation
                    return;
                }

                // submit.removeAttribute('disabled');

                add.addEventListener('click', function (event) {
                    event.preventDefault();

                    hostedFieldsInstance.tokenize(function (tokenizeErr, payload) {
                        if (tokenizeErr) {
                            VZ.notify(tokenizeErr.message.replace('Cannot tokenize invalid card fields.', ''));
                            return;
                        }
                        Meteor.call('createPaymentMethod', payload.nonce, function (error, result) {
                            if (!error) {
                                self.updateCustomerInfo();
                            }
                        });
                    });
                }, false);
            });
        });
    });
});

Template.billingPayMethods.helpers({
    paymentMethods: function () {
        var customer = Template.instance().customerInfo.get();
        return customer.paymentMethods;
    },
    plan: function () {
        // var plans = ReactiveMethod.call('getPlans');
        var plans = Template.instance().plans.get();
        var plan;
        if (plans) {
            _.each(plans.plans, function (element, index, list) {
                if (element.id == 'vezio-pro') {
                    plan = element;
                }
            });
        }
        return plan;
    },
    isSelectingMethod: function () {
        return Template.instance().isSelectingMethod.get();
    },
    isPaymentMethod: function () {
        return _.keys(Template.instance().paymentMethod.get()).length > 0;
    },
    paymentMethod: function () {
        return Template.instance().paymentMethod.get();
    },
    isSubscibed: function (planId) {
        var user = Meteor.users.findOne({_id: Meteor.userId()});
        if(user.profile.billing && user.profile.billing.subscriptions){
            return _.find(user.profile.billing.subscriptions, function(subscription){ return subscription.planId == planId; });
        }
    },
    cardMaskedNumber: function (planId) {
        var user = Meteor.users.findOne({_id: Meteor.userId()});
        if(user.profile.billing && user.profile.billing.subscriptions){
            var subscribtion =  _.find(user.profile.billing.subscriptions, function(subscription){ return subscription.planId == planId; });
            if(subscribtion.maskedNumber)
            return subscribtion.maskedNumber;
        }
    }
});
Template.billingPayMethods.events({
    'click .delete-payment-method': function (event, tmpl) {
        event.preventDefault();
        var token = this.token;
        console.log(token);
        Meteor.call('deletePaymentMethod', token, function (error, result) {
            if (!error) {
                tmpl.updateCustomerInfo();
                // VZ.notify('Removed', result);
            }
            else {
                VZ.notify(error.message);
            }
        });
        Router.go('billing');
    },
    'click .select-card': function (event, tmpl) {
        event.preventDefault();
        tmpl.isSelectingMethod.set(true);
    },
    'click #method': function (event, tmpl) {
        event.preventDefault();
        tmpl.paymentMethod.set(this);
        tmpl.isSelectingMethod.set(false);
    },
    'click .subscribe': function (event, tmpl) {
        event.preventDefault();
        var paymentMethod = tmpl.paymentMethod.get();
        var token = paymentMethod.token;
        var maskedNumber = paymentMethod.maskedNumber;
        Meteor.call('subscribeToPlan', token, maskedNumber, function (error, result) {
            if (result){
                VZ.notify('Subscription successful');
                console.log(result);
                tmpl.paymentMethod.set({});
            }
            else {
                VZ.notify(error.message);
            }
        });
    },
    'click .change-method': function (event, tmpl) {
        event.preventDefault();
        tmpl.isSelectingMethod.set(true);
    },
    'click .change-subscribtion-method': function (event, tmpl) {
        event.preventDefault();
        tmpl.isSelectingMethod.set(true);
    },
    'click .update-subscribtion': function (event, tmpl) {
        event.preventDefault();
        var paymentMethod = tmpl.paymentMethod.get();
        var user = Meteor.users.findOne({_id: Meteor.userId()});
        var planId = this.id;
        var subscribtion =  _.find(user.profile.billing.subscriptions, function(subscription){return subscription.planId == planId; });
        var subscribtionId = subscribtion.id;
        var token = paymentMethod.token;
        var maskedNumber = paymentMethod.maskedNumber;

        Meteor.call('changeSubPaymentMethod', subscribtionId, token, maskedNumber, function (error, result) {
            if(!error){
                VZ.notify('Updated');
                tmpl.paymentMethod.set({});
            }
            else {
                VZ.notify(error.message);
            }
        });
    },
    'click .unsubscribe':function (event, tmpl) {
        event.preventDefault();
        var user = Meteor.users.findOne({_id: Meteor.userId()});
        var planId = this.id;
        var subscribtion =  _.find(user.profile.billing.subscriptions, function(subscription){return subscription.planId == planId; });
        var subscribtionId = subscribtion.id;
        Meteor.call('unSubscribeToPlan', subscribtionId,function (error, result) {
            if(!error){
                VZ.notify('Unsubscribed');
                tmpl.paymentMethod.set({});
            }
            else {
                VZ.notify(error.message);
            }
        });
    },
    'click .settlement': function (event, tmpl) {
        event.preventDefault();
        var paymentMethod = tmpl.paymentMethod.get();
        var token = paymentMethod.token;
        Meteor.call('submitForSettlement', token,function (error, result) {
            if(!error){
                console.log(result);
            }
            else {
                VZ.notify(error.message);
            }
        });
    }
});