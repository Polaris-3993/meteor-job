import './team-item/team-item';
import './all-teams';
import './archived-teams';
import './teams-list.html';

Template.teamsList.onCreated(function () {
    this.currentTab = new ReactiveVar('allTeams');
});

Template.teamsList.onRendered(function () {
    this.$('ul.tabs').tabs();
});

Template.teamsList.helpers({
    tab: function () {
        return Template.instance().currentTab.get();
    },
    formСhanged: function () {
        return Session.get('teamsFormChanged');
    }
});

Template.teamsList.events({
    'click .tabs-row li': function (e, tmp) {
        var currentTab = $(e.target).closest('li');
        tmp.currentTab.set(currentTab.data('template'));
    }
});