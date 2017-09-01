import './view-select.html';

import { VZ } from '/imports/startup/both/namespace';
Template.timetrackerViewSelect.onRendered(function () {
    VZ.UI.select('.vz-select');
});