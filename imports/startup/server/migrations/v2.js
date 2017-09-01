import { Workplaces } from '/imports/api/workPlaces/workPlaces';

Migrations.add({
    version: 2,
    name: 'Using assignedUsersIds instead of assignedUsers in workplaces',
    up: function () {
        Workplaces.find().forEach(function (workplace) {
            if (workplace.assignedUsers) {
                Workplaces.update(workplace._id, {
                    $set: {assignedUsersIds: workplace.assignedUsers},
                    $unset: {assignedUsers: ''}
                });
            }
        });
    },
    down: function () {
        doMigrationIfSchemasIsDisabled(function () {
            Workplaces.find().forEach(function (workplace) {
                if (workplace.assignedUsersIds) {
                    Workplaces.update(workplace._id, {
                        $set: {assignedUsers: workplace.assignedUsersIds},
                        $unset: {assignedUsersIds: ''}
                    });
                }
            });
        });
    }
});