Router.map(function () {
    this.route('screenshots', {
        path: '/screenshots/:screenshotsDate?/:timeZone?',
        layoutTemplate: 'mainLayout',
        onBeforeAction: function () {
            var screenshotsDate = this.params.screenshotsDate;
            var timeZone = this.params.timeZone;
            if (screenshotsDate && timeZone) {
                this.next();
            }
            else {
                Router.go('screenshots', {screenshotsDate: moment().format('YYYY-MM-DD'), timeZone: 'current'});
            }
        },
        action: function () {
            this.render('screenshotsMain');
        },
        data: function () {
            var projectIds = Router.current().params.query.project;
            return {
                pageTitle: 'Screenshots',
                dayToShowScreenshots: Router.current().params.screenshotsDate,
                timeZone: Router.current().params.timeZone,
                projectIds: _.isArray(projectIds) ? projectIds : []

            }

        }
    });

});