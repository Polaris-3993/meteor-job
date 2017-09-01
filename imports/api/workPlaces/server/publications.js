import { Workplaces } from '../workPlaces';
import { Companies } from '/imports/api/companies/companies';

Meteor.publishComposite('Workplaces', function (id) {
    return {
        find: function () {
            if (this.userId) {
                if (id) {
                    return Workplaces.find({
                        _id: id,
                        $or: [
                            {ownerId: this.userId},
                            {assignedUsersIds: this.userId}
                        ]
                    });
                } else {
                    return Workplaces.find({
                        $or: [
                            {ownerId: this.userId},
                            {assignedUsersIds: this.userId}
                        ]
                    });
                }
            }
            this.ready();
        },
        children: [
            {
                find: function (workplace) {
                    var users = workplace.assignedUsersIds || [];
                    users.push(workplace.ownerId);
                    return Meteor.users.find({_id: {$in: users}}, {fields: {roles: 1}});
                }
            },
            {
                find: function (workplace) {
                    return Companies.find({_id: workplace.associatedCompanyId});
                }
            }
        ]
    }
});

Meteor.publish("CompanyWorkplaces", function (companyId) {
    return Workplaces.find({associatedCompanyId: companyId});
})