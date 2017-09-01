Router.map(function () {
    this.route('market', {
        path: '/market',
        layoutTemplate: 'mainLayout',
        action: function () {
            this.render('marketMain');
        },
        data: function () {
            return {
                pageTitle: 'Market'
            }
        }
    });
    this.route('timehtml', {
        path: '/timehtml',
        layoutTemplate: 'mainLayout',
        action: function () {
            this.render('timeTrackerEntriesHtml');
        },
        data: function () {
            return {
                pageTitle: 'Timetracker'
            }
        }
    });

});
