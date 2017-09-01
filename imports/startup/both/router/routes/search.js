Router.map(function () {
    this.route('searchPage', {
        path: '/search',
        layoutTemplate: 'mainLayout',
        onBeforeAction: function () {
            this.next();

        },
        waitOn: function () {
            return this.subscribe('allSearch', this.params.query.q);
        },
        action: function () {
            this.render('search');
        },
        data: function () {
            return {
                searchString: new ReactiveVar(this.params.query.q),
                category: this.params.query.c,
                pageTitle: 'Search'
            }
        }
    })
});