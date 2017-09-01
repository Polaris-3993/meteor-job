import { VZ } from '/imports/startup/both/namespace';
import './create-edit-credentials-modal.html';

const cc = require('currency-codes');
const IBAN = require('iban');
Template.createEditCredentialsModal.onCreated(function () {
    var self = this;
});
Template.createEditCredentialsModal.onRendered(function () {
    var self = this;
    this.$('.modal').modal();
    this.$('.modal').modal('open');
    this.$('select').material_select();

    $('.lean-overlay').on('click', function () {
        removeTemplate(self.view);
    });
    document.addEventListener('keyup', function (e) {
        if (e.keyCode == 27) {
            removeTemplate(self.view);
        }
    });
});
Template.createEditCredentialsModal.onDestroyed(function () {
    $('.lean-overlay').remove();
});

Template.createEditCredentialsModal.helpers({
    currencyCodes: function () {
        return cc.codes();
    },
    isResipient: function (resipient) {
        if (this.bankCredentials && this.bankCredentials.receiverType) {
            var receiverType = this.bankCredentials.receiverType;

            if (receiverType === resipient) {
                return 'checked';
            }
            else {
                return '';
            }
        }
        else {
            return '';
        }
    }
});

Template.createEditCredentialsModal.events({
    'click .save': function (event, tmpl) {
        event.preventDefault();
        var holderName = tmpl.$('#holder-name').val();
        var receiverType = tmpl.$('[name="resipient-type1"]:checked').prop('id');
        var targetCurrency = tmpl.$('#currency-code option:selected').val();
        var addressFirstLine = tmpl.$('#address-first-line').val();
        var addressPostCode = tmpl.$('#address-post-code').val();
        var addressCity = tmpl.$('#address-city').val();
        var addressState = tmpl.$('#address-state').val();
        var addressCountryCode = tmpl.$('#address-country-code').val();
        var abartn = tmpl.$('#abartn').val();
        var accountNumber = tmpl.$('#account-number').val();


        var bankData = {
            name: holderName,
            receiverType: receiverType,
            targetCurrency: targetCurrency,
            addressFirstLine: addressFirstLine,
            addressPostCode: addressPostCode,
            addressCity: addressCity,
            addressState: addressState,
            addressCountryCode: addressCountryCode,
            abartn: abartn,
            accountNumber: accountNumber
        };

        if (tmpl.data && tmpl.data.bankCredentials) {
            bankData._id = tmpl.data.bankCredentials._id;
            Meteor.call('updateBankAccount', bankData, function (error, result) {
                if (!error) {
                    VZ.notify('Updated');
                    tmpl.$('#add-credentials-modal').modal('close');
                    removeTemplate(tmpl.view);
                }
                else {
                    VZ.notify(error.message);
                }
            });
        }
        else {
            Meteor.call('addBankAccount', bankData, function (error, result) {
                if (result) {
                    VZ.notify('Account added');
                    tmpl.$('#add-credentials-modal').modal('close');
                    removeTemplate(tmpl.view);
                }
                else {
                    VZ.notify(error.message);
                }
            });
        }
    },
    'click .cancel': function (event, tmpl) {
        event.preventDefault();
        tmpl.$('#add-credentials-modal').modal('close');
        removeTemplate(tmpl.view);
    }
});

var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};