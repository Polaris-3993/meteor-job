import { Teams } from '../teams';

Meteor.publishComposite('Teams', function (params, options) {
    return {
        find: function () {
            switch (params.visibility) {
                case 'all':
                    _.extend(params, {
                        $or: [
                            {isPrivate: false},
                            {ownerId: this.userId},
                            {membersIds: this.userId}
                        ]
                    });
                    break;
                case 'public':
                    params.isPrivate = false;
                    break;
                case 'lib':
                    _.extend(params, {
                        isPrivate: true,
                        $or: [
                            {ownerId: this.userId},
                            {membersIds: this.userId}
                        ]
                    });
                    break;
            }
            params = _.omit(params, 'visibility');
            return Teams.find(params, options);
        },
        children: [
            {
                find: function (team) {
                    var userIds = team.membersIds || [];
                    return Meteor.users.find({_id: {$in: userIds}}, {fields: {profile: 1, roles: 1}});
                }
            }
        ]
    }
});