import { Projects } from '/imports/api/projects/projects';
import { UserPortfolioProjects } from '../userPortfolioProjects';

Meteor.publish('userPortfolioProjects', function (portfolioProjectsIds) {
    var userId = this.userId;
    if (userId) {
        return UserPortfolioProjects.find({
            _id: {
                $in: portfolioProjectsIds || []
            }
        }, {
            sort: {
                createdAt: -1
            }
        });
    }
});