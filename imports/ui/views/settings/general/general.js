import { VZ } from '/imports/startup/both/namespace';
import './general.html';
import './edit-password-modal/edit-password-modal';

Template.generalSettings.helpers({
passwordUpdated: function () {
    var user = Meteor.users.findOne({_id: Meteor.userId()});
    return user && user.profile && user.profile.passwordUpdated || user.createdAt;
}
});
Template.generalSettings.events({
    'click #change-password': function (event, tmpl) {
        event.preventDefault();
        var user = Meteor.users.findOne({_id: Meteor.userId()});
        if (!user || !user.profile) {
            return;
        }
        var profile = user && user.profile;
        var parentNode = $('body')[0],
            onUserEdit = function (user) {
                Meteor.call('updatePaswordChange', user, function (error, result) {
                    if (error) {
                        VZ.notify(error.message);
                    }
                });
            },
            modalData = {
                profile: profile,
                onUserEdit: onUserEdit
            };
        Blaze.renderWithData(Template.editPasswordModal, modalData, parentNode);
    },
    'click #remove-account': function (event, tmpl) {
        event.preventDefault();
        var really = confirm('Are you sure ?');
        if(really){
            Meteor.call('removeUser', function (error, result) {
                if(error){
                    VZ.notify('Error');
                }
                else {
                    VZ.notify('Removed, bye ');
                    Router.go('login');
                }
            });
        }
    }
});