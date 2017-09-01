import { GoogleApi } from '/imports/api/google-services/server/google-api/connector';

wrapAsyncTest = function () {
    var Google1 = new GoogleApi();
    var file1 = {
        name: "some1",
        size: 2,
        data: "ab",
        type: "text/plain"
    };
    Google1.uploadFile(file1, function (err, res) {
        if (err) {
            console.log(err);
            console.log("Bucket upload failed");
        }
        else {
            console.log(res.data.name);
        }
    });

};
Meteor.methods({
    getFileTest: function () {
        var Google = new GoogleApi();
        var bucket = "vezio_avatars";
        var name = Meteor.users.findOne({
                "profile.firstName": "TOP"
            })._id + "_small";
        console.log(name);
        return Google.getFile(bucket, name, function (err, res) {
            if (err) {
                console.log(err);
                console.log("Object fetch failed");
            }
            else {
                console.log(res);
                return res.data.mediaLink
            }
        })
    }
});
