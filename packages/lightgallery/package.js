Package.describe({
  name: 'vezio:lightgallery',
    version: '0.0.1',
    summary: '',
    git: ''
});


Package.onUse(function(api) {
    api.versionsFrom(['METEOR@1.0']);
    api.use('jquery', 'client');

    api.addAssets([
        'lib/fonts/lg.ttf',
        'lib/fonts/lg.woff',
        'lib/fonts/lg.eot',
        'lib/fonts/lg.svg'

    ], 'client');
    api.addFiles([
        'lib/js/lightgallery.js',
        'lib/js/lg-video.js',
        'lib/css/lightgallery.css',
        'lib/css/lg-fb-comment-box.css',
        'lib/css/lg-fb-comment-box.min.css',
        'lib/css/lg-transitions.css',
        'lib/css/lg-transitions.min.css'
    ], 'client');
});
