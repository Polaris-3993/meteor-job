import './users-search.html';

Template.usersSearch.helpers({
    users: function () {
        var users = Meteor.users.find({_id:{$ne: Meteor.userId()}}).fetch();
        users = _.map(users, function (user) {
            var returnObj = {
                _id: user._id
            };
            
            if(user.profile.firstName && user.profile.lastName){
                returnObj.name = user.profile.firstName + " " + user.profile.lastName;
            }
            
            if(user.profile.photo && user.profile.photo.large){
                returnObj.photo = user.profile.photo.large
            } else {
                returnObj.photo = "/images/default-lockout.png";
            }
            
            return returnObj
        });
        
        return users
    },
});