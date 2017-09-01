Router.map(function () {
    this.route('settings', {
        path: '/settings',
        layoutTemplate: 'mainLayout',
        template: 'settings',
        data: function () {
            return {
                pageTitle: 'Settings'
            }
        }
    });

});