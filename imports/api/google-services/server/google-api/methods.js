// google maps
import {Meteor} from 'meteor/meteor';
import { Tasks } from '/imports/api/tasks/tasks';
import { GoogleApi } from './connector';
import './google-cloud';

Meteor.methods({
    'getCoordinatesFromAddress': function (params) {
        check(params, {
            country: Match.Optional(String),
            city: Match.Optional(String),
            address: Match.Optional(String),
            zip: Match.Optional(String)
        });
        params.city = encodeURIComponent(params.city);
        params.address = encodeURIComponent(params.address);

        var address = _.values(params);

        if (address) {
            var apiKey = Meteor.settings.public.MAPS_API_KEY;

            var url = 'https://maps.googleapis.com/maps/api/geocode/json?address='
                + address + '&key=' + apiKey;
            var res = HTTP.call('GET', url);
            if (res.data.results[0] && res.data.results[0].geometry) {
                return res.data.results[0].geometry.location;
            }
        }
        throw new Meteor.Error('Wrong address!');
    },
    'getTimeZoneNameFromCoordinates': function (lat, lng) {
        if (lat && lng) {
            var now = moment().unix();
            var apiKey = Meteor.settings.public.TIME_ZONE_API_KEY;
            var url = 'https://maps.googleapis.com/maps/api/timezone/json?location='
                + lat + ',' + lng + '&timestamp=' + now + '&key=' + apiKey;
            var resultJSON = HTTP.get(url, {});
            return JSON.parse(resultJSON.content);
        }
        throw new Meteor.Error('Wrong address!');
    },
    'getTimeZoneNameFromCoordinatesForUsers': function (usersWitlLocation) {
        var userWithLocations = [];
        for (var i = 0; i < usersWitlLocation.length; i++) {
            var userCoordinates = usersWitlLocation[i].profile.location.coordinates;
            var lat = userCoordinates.lat;
            var lng = userCoordinates.lng;
            if (lat && lng) {
                var now = moment().unix();
                var apiKey = Meteor.settings.public.TIME_ZONE_API_KEY;
                var url = 'https://maps.googleapis.com/maps/api/timezone/json?location='
                    + lat + ',' + lng + '&timestamp=' + now + '&key=' + apiKey;
                var resultJSON = HTTP.get(url, {});
                var result = JSON.parse(resultJSON.content);
                var timeZoneId = result.timeZoneId;
                userWithLocations.push({userId: usersWitlLocation[i]._id, timeZoneId: timeZoneId});
            }
        }
        return userWithLocations;
    }
});


// photo uploading
Meteor.methods({
    /**
     * Upload photo to Google Storage, returns medialink to uploaded photo
     * @params.name {string} filename.
     * @params.type {string} photo type.
     * @params.bucketName {string} name of google storage bucket
     * @params.buffer {uInt8Array} buffer with photo
     */
    'uploadPhoto': function (params) {
        var typeRegEx = /^image\/(jpeg|JPEG|png|PNG|gif|GIF|tif|TIF)$/;
        if (!typeRegEx.test(params.type)) {
            throw new Meteor.Error('Should be an image!');
        }

        if (params.buffer.length > 5 * 1000 * 1000) {
            throw new Meteor.Error('Image size should be less than 5MB!');
        }

        var file = {
            name: params.name,
            type: params.type,
            size: params.buffer.length,
            data: params.buffer,
            perms: 'publicRead'
        };

        var Google = new GoogleApi();
        return Google.uploadFile(file, params.bucketName).data.mediaLink;
    },

    'uploadVideo': function (params) {
        // PASTE VIDEO REGEX LATER
        // var typeRegEx = /^image\/(jpeg|JPEG|png|PNG|gif|GIF|tif|TIF)$/;
        // if (!typeRegEx.test(params.type)) {
        //     throw new Meteor.Error('Should be an image!');
        // }

        var file = {
            name: params.name,
            type: params.type,
            size: params.buffer.length,
            data: params.buffer,
            perms: 'publicRead'
        };

        try {
            var Google = new GoogleApi();
            return Google.uploadFile(file, params.bucketName).data.mediaLink;
        } catch (e) {
            console.log(e);
        }
    },


    'updateProfilePhoto': function (smallBuffer, largeBuffer, type) {
        var typeRegEx = /^image\/(jpeg|JPEG|png|PNG|gif|GIF|tif|TIF)$/
        var userId = this.userId;
        if (userId) {
            if (!typeRegEx.test(type)) {
                throw new Meteor.Error('Wrong img type!');
            }

            var smallImg = {
                name: userId + '_small',
                type: type,
                size: smallBuffer.length,
                data: smallBuffer,
                perms: 'publicRead'
            };
            var largeImg = {
                name: userId + '_large',
                type: type,
                size: largeBuffer.length,
                data: largeBuffer,
                perms: 'publicRead'
            };

            var Google = new GoogleApi();
            var res = {
                small: uploadFile(Google, smallImg),
                large: uploadFile(Google, largeImg)
            };
            Meteor.users.update({_id: userId}, {
                $set: {
                    'profile.photo.small': res.small,
                    'profile.photo.large': res.large
                }
            }, function (err) {
                if (err) {
                    throw new Meteor.Error('Failed to upload photo, try again');
                }
            });
        }
    },


    'uploadFile': function (filesToUpload) {
        var uploadedFiles = [];
        var Google = new GoogleApi();

        if (filesToUpload.length > 0) {
            for (var i = 0; i < filesToUpload.length; i++) {
                var result = Google.uploadFile(filesToUpload[i], 'vezio_projects_files');
                uploadedFiles.push({
                    fileName: result.data.name,
                    mediaLink: result.data.mediaLink,
                    size: parseInt(result.data.size),
                    uploaded: new Date(result.data.timeCreated)
                });
            }
        }
        return uploadedFiles;
    },
    'uploadTaskFile': function (fileToUpload) {
        // var uploadedFiles = [];
        var Google = new GoogleApi();

        if (_.keys(fileToUpload).length > 0) {
            // for (var i = 0; i < filesToUpload.length; i++) {
            var result = Google.uploadFile(fileToUpload, 'vezio_projects_files');
            var uploadedFile = {
                fileName: result.data.name,
                mediaLink: result.data.mediaLink,
                size: parseInt(result.data.size),
                uploaded: new Date(result.data.timeCreated)
            };
            // }
        }
        return uploadedFile;
    },
    'uploadTaskFileP': function (fileToUpload, taskId) {
        var Google = new GoogleApi();
        if (_.keys(fileToUpload).length > 0) {
            var result = Google.uploadFile(fileToUpload, 'vezio_projects_files');
            var uploadedFile = {
                fileName: result.data.name,
                mediaLink: result.data.mediaLink,
                size: parseInt(result.data.size),
                uploaded: new Date(result.data.timeCreated)
            };
        }
        if (taskId != 'new-task') {
            Tasks.update(taskId, {$push: {taskFiles: uploadedFile}});
        }
        return uploadedFile;
    },

    'uploadVideoP': function (videotoUpload, taskId) {
        // PASTE VIDEO REGEX LATER
        // var typeRegEx = /^image\/(jpeg|JPEG|png|PNG|gif|GIF|tif|TIF)$/;
        // if (!typeRegEx.test(params.type)) {
        //     throw new Meteor.Error('Should be an image!');
        // }
        if (_.keys(videotoUpload).length > 0) {
            var Google = new GoogleApi();
            var result = Google.uploadFile(videotoUpload, 'vezio_projects_files');
            var uploadedFile = {
                fileName: result.data.name,
                mediaLink: result.data.mediaLink,
                size: parseInt(result.data.size),
                uploaded: new Date(result.data.timeCreated),
                type: 'video'
            };
        }
        if (taskId != 'new-task') {
            Tasks.update(taskId, {$push: {taskFiles: uploadedFile}});
        }
        return uploadedFile;
    },

    'uploadMessageFile': function (file) {
        var Google = new GoogleApi();
        if (file) {
            var result = Google.uploadFile(file, 'vezio_projects_files');
            return {fileName: result.data.name, mediaLink: result.data.mediaLink};
        }
    }
});


var uploadFile = function (Google, file) {
    return Google.uploadFile(file, 'vezio_companies_logo', function (err, res) {
        if (err) {
            console.log(err);
            throw new Meteor.Error("uploaderror",err);
        }
        else {
            //console.log('file uploaded');
            return res.data.mediaLink
        }
    })
};