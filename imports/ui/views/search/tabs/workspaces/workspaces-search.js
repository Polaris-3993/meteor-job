import { Workplaces } from '/imports/api/workPlaces/workPlaces';
import './workspaces-search.html';


Template.workplacesSearch.helpers({
    workplaces: function () {
        return Workplaces.find().fetch();
    }
});