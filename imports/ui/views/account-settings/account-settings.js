import './account-settings.html';

Template.accountSettings.onRendered(function () {
    $('.modal-trigger').modal();
});

Template.accountSettings.events({
    'click .cancel-close': function (event, tmpl) {
        tmpl.$('#close-account-modal').modal('close');
    },
    'click .close-account': function (event, tmpl) {
        tmpl.$('#close-account-modal').modal('close');

        Meteor.call('closeAccount', function (err) {
            if (err) {
                $('.toast').hide();
                Materialize.toast(err, 5000);
            } else {
                Accounts.logout();
            }
        });
    }
});