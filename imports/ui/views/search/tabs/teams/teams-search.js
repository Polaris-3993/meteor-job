import { Teams } from '/imports/api/teams/teams';
import './teams-search.html';

Template.teamsSearch.helpers({
    teams: function () {
        return Teams.find().fetch();
    }
});