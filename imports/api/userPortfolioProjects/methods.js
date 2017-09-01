import { Projects } from '/imports/api/projects/projects';
import { UserPortfolioProjects } from './userPortfolioProjects';

Meteor.methods({
    updateThumbnail: function (buffer, type, name) {
        var userId = this.userId;
        var currentTime = moment().unix();
        if (userId) {
            var fileName = userId + '_' + currentTime + '_' + name;
            var params = {
                name: fileName,
                type: type,
                buffer: buffer,
                bucketName: 'vezio_portfolio_images'
            };
            try {
                var mediaLink = Meteor.call('uploadPhoto', params);
                console.log(mediaLink);
                return mediaLink;
            } catch (e) {
                return e;
            }
        }
    },
    insertPortfolioProject: function (portfolio) {
        var userId = this.userId;
        if (userId) {
            var id = UserPortfolioProjects.insert(portfolio);
            Meteor.users.update({
                _id: userId
            }, {
                $addToSet: {
                    'profile.portfolioProjects': id
                }
            }, function (err) {
                if (err) {
                    throw new Meteor.Error('Failed to insert');
                }
            });
        }

    },

    updatePortfolioProject: function (id, portfolio) {
        var userId = this.userId;
        if (userId) {
            UserPortfolioProjects.update({_id: id}, {$set: portfolio}, function (error) {
                if (error) {
                    throw new Meteor.Error(error.message);
                }
            });
        }
    },
    removePortfolioProject: function (id) {
        var userId = this.userId;
        if (userId) {
            UserPortfolioProjects.remove(id);
            Meteor.users.update({_id: userId}, { $pull: { 'profile.portfolioProjects': id }});
        }
    }
});