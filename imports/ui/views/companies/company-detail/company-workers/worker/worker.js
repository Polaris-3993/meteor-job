import './worker.html';

Template.companyDetailWorker.onCreated(function () {
    this.subscribe("userPresence", this.data.workerId);
});

Template.companyDetailWorker.onRendered(function () {
});

Template.companyDetailWorker.helpers({
    user: function () {
        var user = Meteor.users.findOne({_id: this.workerId})
        return user;
    },
    
    userPhoto: function () {
        var user = Meteor.users.findOne({_id: this.workerId})
        if(user.profile.photo && user.profile.photo.large) {
            return user.profile.photo.large;
        }
        
        return "/images/default-lockout.png"
    },
    
    userPosition: function () {
        var user = Meteor.users.findOne({_id: this.workerId});
        var roles = user.roles[this.companyId];
        if(roles){
            if(_.contains(roles, "company-admin")){
                return "Owner";
            }
            if(_.contains(roles, "company-manager")){
                return "Manager"
            }
            if(_.contains(roles, "company-worker")){
                return "Worker"
            }
        }
        
        return ""
    },
    
    onlineStatus: function () {
        var userStatus = UserPresences.findOne({userId: this.workerId});
        
        if(userStatus){
            return userStatus.state
        }
        
        return "offline"
    }
});