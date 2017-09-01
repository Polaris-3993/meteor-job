import { VZ } from '/imports/startup/both/namespace';
import './video-upload.html';

Template.devVideoUpload.events({
    'change #videoInput': function (e, tmpl) {
        var file = $(e.target).prop('files')[0]

        var reader = new FileReader();
        reader.onload = function (event) {
            var buffer = new Uint8Array(reader.result);

            Meteor.call('uploadScreenRecord', buffer, file.type, function (err, res) {

                if (err) {
                    VZ.notify('Failed to upload video');
                }
                else {
                    VZ.notify('Video uploaded!');
                }

            })

        };
        reader.readAsArrayBuffer(file);
    }
})