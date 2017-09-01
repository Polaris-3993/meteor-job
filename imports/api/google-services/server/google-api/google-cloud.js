import { GoogleApi } from './connector';

GoogleApi.prototype.bucketList = function (cb) {
    var self = this;
    var token = this.token;
    var privateInfo = Meteor.settings.private.GOOGLE;
    var syncHTTP = Meteor.wrapAsync(HTTP.get, this);
    try {
        var res = HTTP.get('https://www.googleapis.com/storage/v1/b', {
            headers: {
                Authorization: 'Bearer' + ' ' + token
            },
            params: {
                project: privateInfo.project_id
            }
        });
        return cb(null, res.data.items);
    }
    catch (err) {
        cb(err);
    }
};

GoogleApi.prototype.uploadFile = function (file, bucket, cb) {
    var self = this;
    var token = this.token;
    var privateInfo = Meteor.settings.private.GOOGLE;
    var syncPost = Meteor.wrapAsync(HTTP.post, this);
    try {
        var res = HTTP.post('https://www.googleapis.com/upload/storage/v1/b/' + bucket + '/o', {
            headers: {
                'Content-Type': file.type,
                // 'Content-Disposition': 'inline',
                'Content-Length': file.size,
                Authorization: 'Bearer' + ' ' + token
            },
            params: {
                project: privateInfo.project_id,
                uploadType: 'media',
                name: file.name,
                predefinedAcl: file.perms
            },
            content: file.data
        });
        if (cb) {
            return cb(null, res);
        }
        else {
            return res;
        }
    }
    catch (err) {
        if (cb) {
            cb(err, null);
        } else {
            throw err;
        }
    }
};

GoogleApi.prototype.getFile = function (bucket, fileName, cb) {
    var token = this.token;
    try {
        var res = HTTP.get('https://www.googleapis.com/storage/v1/b/' + bucket + '/o/' + fileName, {
            headers: {
                Authorization: 'Bearer' + ' ' + token
            },
            params: {
                //alt: 'media'
            }
        });
        if (cb) {
            return cb(null, res);
        }
        else {
            return res;
        }
    }
    catch (err) {
        if (cb) {
            cb(err);
        }
        else {
            return err
        }

    }
};
