Router.map(function () {
    this.route('account-closed', {
        path: '/account-closed',
        layoutTemplate: 'authLayout',
        action: function () {
            this.render('accountClosed');
        }
    });

});