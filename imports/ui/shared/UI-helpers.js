import { Countries } from '/imports/api/countries/countries';

UI.registerHelper('equal', function (param1, param2) {
    return param1 == param2;
});

UI.registerHelper('oneOf', function (param, params) {
    return !!_.find(params, function (p) {
        return p == param;
    })
});

UI.registerHelper('greater', function (param1, param2) {
    return param1 > param2;
});

UI.registerHelper('greaterEqual', function (param1, param2) {
    return param1 >= param2;
});

UI.registerHelper('less', function (param1, param2) {
    return param1 < param2;
});

UI.registerHelper('lessEqual', function (param1, param2) {
    return param1 <= param2;
});

UI.registerHelper('isCursorOrArrayHasDocuments', function (cursorOrArray) {
    return _.isArray(cursorOrArray) ? cursorOrArray.length > 0
        : cursorOrArray.count() > 0;
});

UI.registerHelper('formatDate', function (date, format) {
    format = _.isString(format) ? format : 'MMMM DD YYYY';
    return moment(date).format(format);
});

UI.registerHelper('formatFileSize', function (bytes) {
    if(typeof bytes == 'number'){
        if(bytes == 0) return '0 Byte';
        var k = 1000;
        var dm = 1;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    else {
        return bytes;
    }
});

UI.registerHelper('getUserNameById', function (id) {
    var user = Meteor.users.findOne(id);
    return user && user.profile && user.profile.fullName ?
        user.profile.fullName : 'undefined';
});

UI.registerHelper('getUserSmallPhotoById', function (id) {
    var user = Meteor.users.findOne(id);
    return user && user.profile && user.profile.photo && user.profile.photo.small ?
        user.profile.photo.small : '/images/default-lockout.png';
});

UI.registerHelper('getUserLargePhotoById', function (id) {
    var user = Meteor.users.findOne(id);
    return user && user.profile && user.profile.photo && user.profile.photo.large ?
        user.profile.photo.large : '/images/default-lockout.png'; // same file as small image
});

UI.registerHelper('and', function () {
    var i = 0;
    while (i < arguments.length - 1) {
        if (!arguments[i]) {
            return false;
        } else {
            i++;
        }
    }
    return true;
});

UI.registerHelper('or', function () {
    var i = 0;
    while (i < arguments.length - 1) {
        if (arguments[i]) {
            return true;
        } else {
            i++;
        }
    }
    return false;
});

UI.registerHelper('isInArray', function (array, value) {
    return !!_.find(array, function (arrItem) {
        return value == arrItem;
    })
});

UI.registerHelper('urlPatternt', function () {
    return '^(https?:\/\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\/\\w\\.-]*)*\/?$';
});

UI.registerHelper('getUserSmallAvatarById', function (userId) {
    var user = userId ? Meteor.users.findOne(userId) : Meteor.user();

    if (user && user.profile && user.profile.photo) {
        return user.profile.photo.small
            ? user.profile.photo.small : user.profile.photo.large;
    } else {
        return '/images/default-avatar.png';
    }
});


UI.registerHelper('currencySymbol', function (currency) {
    switch (currency) {
        case 'usd':
            return '$';
        case 'euro':
            return '€';
        case 'gbp':
            return '£';
    }
});

UI.registerHelper('countriesList', function () {
    Meteor.subscribe('allCountries');
    return Countries.find({}, {sort: {label: 1}}).fetch();
});
UI.registerHelper('formatJobsDate', function (date, format) {
    return moment(date).format(format || 'YYYY.MM.DD HH:mm');
});

UI.registerHelper('dateFromNow', function (date) {
    return moment(date).from();
});

UI.registerHelper('getCountryLabelByCode', function (code) {
    var countryObj = _.find(Countries.find().fetch(), function (it) {
        return it.countryCode == code;
    });
    return countryObj ? countryObj.label : null;
});