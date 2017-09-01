import { UserEducation } from '../userEducations';

Meteor.publish('userEducation', function (educationIds, limit) {
    var userId = this.userId;
    if (userId) {
        return UserEducation.find({
            _id: {
                $in: educationIds || []
            }
        }, {
            sort: {
                completeAt: -1
            },
            limit: limit
        });
    }
});