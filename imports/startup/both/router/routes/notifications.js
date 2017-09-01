Router.map(function () {
    this.route('notifications', {
        path: '/notifications',
        layoutTemplate: 'mainLayout',
        action: function () {
            this.render('notifications');
        },
        data: function () {
            return {
                pageTitle: 'Notifications'
            }
        }
    });

});