Router.map(function () {
    this.route('timeBoardTasks', {
        path: '/timeBoard/tasks',
        layoutTemplate: 'mainLayout',
        template: 'timeBoardTasks',
        data: function () {
            return {
                pageTitle: 'Tasks'
            }
        }
    });

    this.route('timeBoardGeographic', {
        path: '/timeBoard/geographic',
        layoutTemplate: 'mainLayout',
        template: 'timeBoardGeographic',
        data: function () {
            return {
                pageTitle: 'Geographic View'
            }
        }
    });

    this.route('timeBoardActivity', {
        path: '/timeBoard/activity',
        layoutTemplate: 'mainLayout',
        template: 'timeBoardActivity',
        data: function () {
            return {
                pageTitle: 'Activity'
            }
        }
    });
});