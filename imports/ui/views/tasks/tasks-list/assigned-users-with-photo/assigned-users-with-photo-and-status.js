import './assigned-users-with-photo-and-status.html';

Template.assignedUsersWithPhotoAndStatus.onRendered(function () {
    this.$('.user-with-tip').tooltipsy({
        offset: [0, 10],
        delay:0,
        css: {
            'padding': '2px 15px',
            'font-size':'12px',
            'font-weight':'500',
            'border-radius':'4px',
            'max-width': '150px',
            'color': '#fff',
            'background-color': '#8b8b8b',
            'text-shadow': 'none'
        }
    });
});

Template.assignedUsersWithPhotoAndStatus.onDestroyed(function () {
    this.$('.user-with-tip').data('tooltipsy').hide();
});
Template.assignedUsersWithPhotoAndStatus.helpers({
    userNamePhoto(userId) {
        var user = Meteor.users.findOne(userId, {
            fields: {profile: 1, roles: 1, emails: 1}
        });
        return user && user.profile && user.profile.fullName;
    },
    userPhoto(userId) {
        const user = Meteor.users.findOne(userId, {
            fields: {profile: 1, roles: 1, emails: 1}
        });
        return user && user.profile && user.profile.photo && user.profile.photo.small;
    },
    isOnline(userId) {
      const user = Meteor.users.findOne(userId, {fields:{profile:1}});
      if(user && user.profile) {
        return user.profile.online;
      }
    }
});

