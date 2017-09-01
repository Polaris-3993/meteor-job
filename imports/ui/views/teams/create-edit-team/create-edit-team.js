import { VZ } from '/imports/startup/both/namespace';
import './create-edit-team.html';

Template.createEditTeam.onCreated(function () {
});

Template.createEditTeam.onRendered(function () {
});

Template.createEditTeam.onDestroyed(function () {
});

Template.createEditTeam.helpers({
    isPrivate: function () {
        return this.team && this.team.isPrivate;
    }
});

Template.createEditTeam.events({
    'submit #createEditTeamForm': _.throttle(function (event, tmpl) {
        var getTeamDocument = function () {

            var name = tmpl.$('#name').val().trim();
            var description = tmpl.$('#description').val().trim();

            var visibility = tmpl.$('[name="visibility"]:checked').val();

            var team = {};

            team.name = name;
            team.isPrivate = visibility == 'lib';

            if (description) {
                team.description = description;
            }
            return team;
        };

        event.preventDefault();
        tmpl.$('#submit-form-button').attr('disabled', 'disabled');

        var team = getTeamDocument();
        if (tmpl.data && tmpl.data.team) {
            team._id = tmpl.data.team._id;
            team.membersIds = tmpl.data.team.membersIds;
            Meteor.call('updateTeam', team, function (err) {
                if (err) {
                    VZ.notify(err);
                    tmpl.$('#submit-form-button').removeAttr('disabled');
                } else {
                    VZ.notify('Successfully updated!');
                    Router.go('teams', {visibility: 'public'});
                }
            });
        } else {
            Meteor.call('createTeam', team, function (err) {
                if (err) {
                    VZ.notify(err);
                    tmpl.$('#submit-form-button').removeAttr('disabled');
                } else {
                    VZ.notify('Successfully created!');
                    Router.go('teams', {visibility: 'public'});
                }
            });
        }
    }, 1000)
});
