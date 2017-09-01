import { Workplaces } from '/imports/api/workPlaces/workPlaces';
import './company-workplaces.html';

Template.companyDetailWorkplaces.helpers({
    workplaces: function () {
        return Workplaces.find();
    }
});