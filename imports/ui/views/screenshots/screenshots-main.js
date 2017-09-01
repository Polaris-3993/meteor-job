import './screenshots-main.html';
Template.screenshotsMain.onCreated(function () {
});
Template.screenshotsMain.onRendered(function () {
    this.$('ul.tabs').tabs();

    /* SELECT */
    $('select').material_select();

    /* tooltip */
    $('.tooltipped').tooltip({delay: 50});


});
Template.screenshotsMain.onDestroyed(function () {
    this.$('.tooltipped').tooltip('remove');
});

Template.screenshotsMain.helpers({
    tab: function () {
        var userRole = Session.get('user-role');
        return userRole === 'user' ? 'myScreenshots' : userRole === 'company' ? 'workersScreenshots' : false;
    }
});

Template.screenshotsMain.events({
});