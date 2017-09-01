import { Companies } from '/imports/api/companies/companies';
SyncedCron.add({
    name: 'Company deleting',
    schedule: function (parser) {
        // parser is a later.parse object
        return parser.text('at 00:00');
    },
    job: function () {
        var companies = Companies.find({status: 'archived'}).fetch(),
            currDate = moment();

        _.each(companies, function (company) {
            var archivedAt = moment(company.archivedAt),
                diff = currDate.diff(archivedAt, 'milliseconds'),
                oneDay = 1000 * 60 * 60 * 24;

            if (diff >= oneDay * 60) {
                console.log('Removed company"' + company.name + '"');
                deleteCompany(company._id);
            }
        });
    }
});

var deleteCompany = function (id) {
    var companyToDelete = Companies.findOne({_id: id, status: 'archived'});
    if (companyToDelete) {
        var companyArminId = companyToDelete.ownerId;
        var companyWorkersIds = companyToDelete.workersIds;

        Roles.removeUsersFromRoles(companyArminId, 'company-admin', companyToDelete._id);
        Roles.removeUsersFromRoles(companyWorkersIds, 'company-workers', companyToDelete._id);
        return true;
    } else {
        throw new Meteor.Error('Company is not found or can\'t be deleted!');
    }
};