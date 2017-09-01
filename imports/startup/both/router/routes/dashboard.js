Router.map(function () {
    this.route('dashboard', {
        path: '/dashboard',
        layoutTemplate: 'mainLayout',
        template: 'dashboard',
        // waitOn: function () {
        //     return [
        //         this.subscribe('Tasks'),
        //         this.subscribe('Projects'),
        //         this.subscribe('Contracts')
        //     ]
        // },
        data: function () {
            return {
                pageTitle: 'Dashboard'
            }
        }
    });
});
