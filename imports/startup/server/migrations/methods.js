Meteor.methods({
    'migrateToLatest': function () {
        var currentMigrationVersion = Migrations.getVersion();
        var allMigrations = Migrations._list;
        var migrationIn2StepsForwardFromCurrent =
            _.find(allMigrations, function (migration) {
                return migration.version > currentMigrationVersion + 1;
            });

        if (!migrationIn2StepsForwardFromCurrent) {
            Migrations._collection.update({_id: 'control'}, {$set: {'locked': false}});
            Migrations.migrateTo('latest');
        } else {
            var errorMessage = 'You can\'t migrate more than one times with the same schema!';
            throw new Meteor.Error(errorMessage);
            console.log(errorMessage);
        }
    }
});

doMigrationIfSchemasIsDisabled = function (migrationFn) {
    if (Meteor.settings.dontUseSchema) {
        migrationFn();
    } else {
        var errorMessage = 'Run meteor without schemas when do migration!';
        throw new Meteor.Error(errorMessage);
        console.log(errorMessage);
    }
};