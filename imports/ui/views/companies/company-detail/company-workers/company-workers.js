import './company-workers.html';
import './worker/worker';

Template.companyDetailWorkers.onRendered(function () {
})

Template.companyDetailWorkers.helpers({
    companyWorkers: function () {
        var workers = this.company.workersIds;
        workers.unshift(this.company.ownerId);
        return workers;
    },
    
    companyId: function () {
        return Template.instance().data.company._id;
    }
})