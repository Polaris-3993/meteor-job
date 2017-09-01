import { VZ } from '/imports/startup/both/namespace';
import './job-description-editor.html';

Template.jobDescriptionEditor.onCreated(function () {
    this.charsCount = new ReactiveVar(0);
    this.isFocused = new ReactiveVar(false);
    this.countCharacters = function () {
        var body = tinymce.get("description").getBody();
        var content = tinymce.trim(body.innerText || body.textContent);
        return {
            content: content,
            length: content.length
        }
    };
});

Template.jobDescriptionEditor.onRendered(function () {
    var self = this;
    tinymce.init({
        selector: '#description',
        elementpath: false,
        menubar: false,
        statusbar: false,
        plugins: "autoresize imagetools autolink link image paste",
        autoresize_max_height: 500,
        autoresize_bottom_margin: 0,
        fontsize_formats: "8px 10px 12px 14px 18px 24px 36px",
        toolbar: "styleselect | fontsizeselect | sizeselect | bold  italic " +
        " underline | bullist numlist | alignleft aligncenter alignright | link image",
        skin_url: '/packages/teamon_tinymce/skins/lightgray',
        font_formats: 'Arial=arial,helvetica,sans-serif;',
        paste_webkit_styles: "all",
        paste_preprocess: function (plugin, args) {
            var maxChars = 10000;
            var count = self.countCharacters();
            var content = args.content.replace(/(<([^>]+)>)/ig, '');
            var allContent = count.content + content;
            var allCount = allContent.length;
            if (allCount >= maxChars) {
                var overMax = allContent.slice(maxChars);
                args.content = content.replace(overMax.toString(), '');
            }
        },
        setup: function (ed) {
            ed.on('init', function () {
                this.getDoc().body.style.fontSize = '14px';
                this.getDoc().body.style.fontFamily = 'Arial';
            });
            ed.on('keyup', function (event) {
                var maxChars = 10000;
                var count = self.countCharacters();
                self.charsCount.set(count.length);
            });
            ed.on('keydown', function (event) {
                var maxChars = 10000;
                var count = self.countCharacters();
                self.charsCount.set(count.length);
                if (count.length >= maxChars && event.keyCode != 8 && event.keyCode != 46) {
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
            });
            ed.on('focus', function () {
                self.isFocused.set(true);

            });
            ed.on('blur', function () {
                self.isFocused.set(false);

            });

        },
        file_browser_callback: function (field_name, url, type, win) {
            // outher input, for open file browser and get file
            var $imageInput = self.$('#desc-image-input');

            // event handler for this input
            $imageInput.on('change', function (event) {
                var file = event.target.files[0];
                if (file && /image\/\w+/.test(file.type)) {
                    if (file.size > 5 * 1000 * 1000) {
                        VZ.notify('Image size should be less than 5MB!');
                    }

                    var reader = new FileReader();
                    reader.onload = function () {
                        var buffer = new Uint8Array(reader.result);
                        var data = {
                            name: 'image_' + moment().unix(),
                            type: file.type,
                            bucketName: 'vezio-jobs-adv-images',
                            buffer: buffer
                        };

                        // upload photo to google storage bucket
                        Meteor.call('uploadPhoto', data, function (err, res) {
                            if (err) {
                                VZ.notify(err.message);
                            } else {
                                // write medialink of uploaded image to tinyMCE image tool
                                win.document.getElementById(field_name).value = res;
                            }
                        });
                    };

                    reader.readAsArrayBuffer(file);
                } else {
                    VZ.notify('Should be an image!');
                }
            });

            // trigger click event, will open file browser tool
            $imageInput.click();
        }
    });

    this.autorun(function () {
        var currData = Template.currentData();
        tinymce.get('description').setContent(currData && currData.job
            ? currData.job.description : '');
        var count = self.countCharacters();
        self.charsCount.set(count.length);
    });
});

Template.jobDescriptionEditor.onDestroyed(function () {
    // for correct work, editor should be removed
    tinymce.get('description').remove();
});

Template.jobDescriptionEditor.helpers({
    chars: function () {
        return Template.instance().charsCount.get();
    },
    isFocused: function () {
        return Template.instance().isFocused.get();
    }
});