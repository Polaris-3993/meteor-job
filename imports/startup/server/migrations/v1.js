Migrations.add({
    version: 1,
    name: 'Adding fullName field to user',
    up: function () {
        var users = Meteor.users.find().fetch();
        _.each(users, function (user) {
            var firstName = user.profile.firstName;
            var lastName = user.profile.lastName;
            var fullName = '';
            if (firstName) {
                fullName = firstName;
            }
            if (lastName) {
                fullName = fullName + ' ' + lastName
            }
            Meteor.users.update({_id: user._id}, {$set: {'profile.fullName': fullName}});
        });
    },
    down: function () {
        doMigrationIfSchemasIsDisabled(function () {
            Meteor.users.update({}, {$unset: {'profile.fullName': ''}}, {upsert: true})
        });
    }
});