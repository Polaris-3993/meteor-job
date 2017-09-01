import { UserWorkExperience } from '../userWorkExperience';

Meteor.publish('userWorkExperience', function (workExperienceIds, limit) {
    var userId = this.userId;
    if (userId) {
        return UserWorkExperience.find({
            _id: {
                $in: workExperienceIds || []
            }
        }, {
            sort: {
                startAt: -1
            },
            limit: limit
        });
    }
});