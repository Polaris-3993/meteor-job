import './profile-main.html';
import './cards/cards';
import './edit-profile-modal/edit-profile-modal';
import './profile-description/profile-description';
import './profile-header/profile-header';
import './profile-name/profile-name';
import './start-conversation/start-conversation';
import './upload-profile-photo-modal/upload-profile-photo-modal';
import './upload-background-photo-modal/upload-background-photo-modal';
import './user-location-modal/user-location-modal';

Template.profileMain.onCreated(function () {
});

Template.profileMain.onRendered(function () {
});
Template.profileMain.onDestroyed(function () {
    $('body').off('resize');
});
Template.profileMain.events({});

Template.profileMain.helpers({});