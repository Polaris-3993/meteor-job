Package.describe({
    name: 'vezio:webrtc',
    version: '0.0.1',
    // Brief, one-line summary of the package.
    summary: '',
    // URL to the Git repository containing the source code for this package.
    git: '',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.1.0.3');
    api.use('ecmascript', ['client', 'server']);

    api.use([
        'vezio:base',
        'fds:webrtc'
    ]);
    
    api.addFiles([
        'signalling-stream.js'
    ], ['client', 'server']);

    api.addFiles([
        'server/signalling-config.js'
    ], 'server');
    
    
    api.export('stream');
});

