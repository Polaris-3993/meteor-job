Router.map(function () {
    // this.route('timeTracker', {
    //     path: '/time-tracker',
    //     layoutTemplate: 'mainLayout',
    //     template: 'timeTrackerEntries',
    //     data: function () {
    //         return {
    //             pageTitle: 'Time tracker'
    //         }
    //     },
    //     waitOn: function () {
    //         return [
    //             this.subscribe('Projects')
    //         ];
    //     }
    // });

    this.route('timeTrackerReports', {
        path: '/time-tracker/reports',
        layoutTemplate: 'mainLayout',
        template: 'timeTrackerReports',
        data: function () {
            return {
                pageTitle: 'Reports'
            }
        },
        waitOn: function () {
            return [
                this.subscribe('Projects')
            ];
        }
    });

    this.route('timeTrackerProjects', {
        path: '/time-tracker/projects',
        layoutTemplate: 'mainLayout',
        template: 'timeTrackerProjects',
        data: function () {
            return {
                pageTitle: 'Projects'
            }
        },
        waitOn: function () {
            return [
                this.subscribe('Projects')
            ];
        }
    });
});
