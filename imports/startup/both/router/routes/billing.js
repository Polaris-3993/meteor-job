Router.map(function () {
    this.route('billing', {
        path: '/billing (not used now)',
        layoutTemplate: 'mainLayout',
        action: function () {
            this.render('billingMain');
        },
        data: function () {
            return {
                pageTitle: 'Billing'
            }
        }
    });
});