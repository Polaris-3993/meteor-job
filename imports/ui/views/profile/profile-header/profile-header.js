import { Meteor } from 'meteor/meteor';
import { VZ } from '/imports/startup/both/namespace';
import './profile-header.html';
import {Skills} from '/imports/api/skills/skills.js';

Template.profileHeader.onCreated(function () {
    var self = this;
    this.loadingPhoto = new ReactiveVar(false);
    this.loadingBackground = new ReactiveVar(false);
    this.timeZoneName = new ReactiveVar('');
    this.getUserCoordinates = function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile || !user.profile.location) {
            return;
        }
        var lat = user.profile.location.coordinates.lat;
        var lng = user.profile.location.coordinates.lng;

        Meteor.call('getTimeZoneNameFromCoordinates', lat, lng, function (error, result) {
            if (!error) {
                self.timeZoneName.set(result.timeZoneId);
            }
        });
    };
    this.autorun(function () {
        Template.currentData();
        var userId = Router.current().params.id;
        self.subscribe('user', userId);
        self.subscribe('userPresence', userId);
        self.subscribe('userDetailNext', userId);
        self.subscribe('userDetailPrev', userId);
        self.subscribe('userSkills', userId);
        self.getUserCoordinates();
    });
});

Template.profileHeader.events({
    'click .change-profile-pic': function (event, tmpl) {
        event.preventDefault();

        var parentNode = $('body')[0],
            onPhotoUpload = function (status) {
                tmpl.loadingPhoto.set(status);
            },
            modalData = {
                onPhotoUpload: onPhotoUpload
            };
        Blaze.renderWithData(Template.uploadPhotoModal, modalData, parentNode);
    },

    'click .change-cover-pic': function (event, tmpl) {
        event.preventDefault();
        var parentNode = $('body')[0],
            onPhotoUpload = function (status) {
                tmpl.loadingBackground.set(status);
            },
            modalData = {
                onPhotoUpload: onPhotoUpload
            };
        Blaze.renderWithData(Template.uploadBackgroundPhotoModal, modalData, parentNode);
    },

    'click .edit-icon': function (event, tmpl) {
        event.preventDefault();
        var user = Meteor.users.findOne({_id: Meteor.userId()});
        if (!user || !user.profile) {
            return;
        }
        var profile = user && user.profile;
        var parentNode = $('body')[0],
            onUserEdit = function (user) {
                Meteor.call('updateProfile', user, function (error, result) {
                    if (!error) {
                        VZ.notify('Success');
                    }
                });
            },
            modalData = {
                profile: profile,
                onUserEdit: onUserEdit
            };
        Blaze.renderWithData(Template.editProfileModal, modalData, parentNode);
    },

    'click .show-on-map': function (event, tmpl) {
        event.preventDefault();
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        var parentNode = $('body')[0],
            modalData = {
                haveLocation: !!user.profile.location,
                coordinates: {
                    lat: user.profile.location.coordinates.lat,
                    lng: user.profile.location.coordinates.lng
                }
            };
        Blaze.renderWithData(Template.userLocationModal, modalData, parentNode);
    },
    'click #change-settings': function (event, tmpl) {
        event.preventDefault();
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        var availability = !user.profile.availability;
        Meteor.call('changeAvailability', availability, function (err, res) {
            if (err) {
            }
        });
    },
    'click .prev': function (event, tmpl) {
        event.preventDefault();
        Router.go('userProfile', {id: this._id});
    },
    'click .next': function (event, tmpl) {
        event.preventDefault();
        Router.go('userProfile', {id: this._id});
    }
});

Template.profileHeader.helpers({
    profilePhoto: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (!user.profile.photo || !user.profile.photo.large) {
            return '/images/default-lockout.png'
        }

        return user.profile.photo.large;
    },

    backgroundPhoto: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (!user.profile.photo || !user.profile.photo.background) {
            return 'http://i.imgur.com/AMf9X7E.jpg'
        }
        // background: url({{backgroundPhoto}}); background-size:cover

        return user.profile.photo.background;
    },

    loadingPhoto: function () {
        return Template.instance().loadingPhoto.get();
    },

    loadingBackground: function () {
        return Template.instance().loadingBackground.get();
    },

    profileOwner: function () {
        return isProfileOwner();
    },

    photoHoverable: function () {
        return isProfileOwner() ? 'hoverable' : '';
    },

    profileName: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }

        var profile = user.profile,
            firstName = profile.firstName,
            lastName = profile.lastName;

        if (!firstName || !lastName || !_.isEmpty(firstName.trim()) || !_.isEmpty(lastName.trim()))
            return firstName + ' ' + lastName;
        else
            return 'Unnamed Capybara';
    },
    profileHourlyRate: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (user.profile.hourlyRate)
            return user.profile.hourlyRate;

    },
    profileAvailabilityTime: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (user.profile.availabilityTime)
            return user.profile.availabilityTime.toLowerCase();
    },

    profileSkills: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (user.profile.skills){
            var userSkills = Skills.find({_id: {$in: user.profile.skills}}).fetch();
            var userSkillsValue = _.map(userSkills, function (skill) {
                return skill.label;
            });
            return userSkillsValue;
        }
        else{
            return [];

        }
    },

    profileOverview: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (user.profile.overview)
            return user.profile.overview;
        else
            return [];
    },

    profileLocation: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (user.profile && user.profile.location)
            return user.profile.location.locality + ', ' + user.profile.location.country;

    },

    profileAvailability: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (user.profile.availability) {
            return 'available';

        }
        else {
            return 'unavailable';
        }
    },
    isOnline: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (user.profile.online) {
            return 'online'
        }
        return 'offline';
    },
    userStatus: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        return user.profile.online ? 'Online' : user.profile.lastOnline ? 'Last online ' + moment(user.profile.lastOnline).fromNow() :'';
    },
    isLocation: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        return user.profile.location;
    },
    localTime: function () {
        var timeZoneId = Template.instance().timeZoneName.get();
        return moment.tz(timeZoneId).format('hh:mm a')
    },
    isHired: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        return user.profile.availability;
    },
    prevUser: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        var prevUser = Meteor.users.findOne({createdAt: {$lt: user.createdAt}}, {sort: {createdAt: -1}});
        return prevUser;
    },
    nextUser: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        var nextUser = Meteor.users.findOne({createdAt: {$gt: user.createdAt}}, {sort: {createdAt: 1}});
        return nextUser;
    }
});

function isProfileOwner() {
    var user = Meteor.users.findOne({_id: Router.current().params.id});
    if (user) {
        return Meteor.userId() === user._id;
    }

    return false
}