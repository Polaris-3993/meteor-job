import { VZ } from '/imports/startup/both/namespace';
import braintree from 'braintree-web/client';
import hostedFields from 'braintree-web/hosted-fields';
import './change-credit-card-modal.html';

Template.changeCreditCardModal.onCreated(function () {
    var self = this;
    this.hasPassword = new ReactiveVar(true);

    this.autorun(function () {
        Template.currentData();
    });
    $('.lean-overlay').on('click', function () {
        removeTemplate(self.view);
    });
    document.addEventListener('keyup', function(e) {
        if (e.keyCode == 27) {
            removeTemplate(self.view);
        }
    });
});
Template.changeCreditCardModal.onRendered(function () {
    this.$('.modal').modal();
    this.$('.modal').modal('open');
    this.$('select').material_select();
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
                    return;
                }
                add.addEventListener('click', function (event) {
                    event.preventDefault();

                    hostedFieldsInstance.tokenize(function (tokenizeErr, payload) {
                        if (tokenizeErr) {
                            VZ.notify(tokenizeErr.message.replace('Cannot tokenize invalid card fields.', ''));
                            return;
                        }
                        Meteor.call('updatePaymentMethod', payload.nonce, self.data.customer, function (error, result) {
                            if (!error) {
                                self.data.onCardChange();
                                self.$('#edit-card-modal').modal('close');
                                removeTemplate(self.view);
                            } else {
                                VZ.notify(error.message);
                            }
                        });
                    });
                }, false);
            });
        });
    });


    $('.lean-overlay').on('click', function () {
        removeTemplate(self.view);
    });
    document.addEventListener('keyup', function (e) {
        if (e.keyCode == 27) {
            removeTemplate(self.view);
        }
    });
    this.autorun(function () {
        Template.currentData();
    });
});
Template.changeCreditCardModal.onDestroyed(function () {
    $('.lean-overlay').remove();
});
Template.changeCreditCardModal.helpers({
    hasPassword: function () {
        return Template.instance().hasPassword.get();
    }
});
Template.changeCreditCardModal.events({
    'click .cancel': function (event, tmpl) {
        event.preventDefault();
        tmpl.$('#edit-card-modal').modal('close');
        removeTemplate(tmpl.view);
    }
});
var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};
