import './menu-item/menu-item';
import './left-menu.html';

Template.leftMenu.onCreated(function () {
    this.categories = [

        {
            title: 'Project Management',
            items: [
                {
                    link: Router.path('projects'),
                    icon: 'work',
                    title: 'Projects'
                }
            ]
        },
        {
            title: 'Work History',
            items: [

                {
                    link: Router.path('screenshots'),
                    icon: 'wallpaper',
                    title: 'Screenshots'
                }
            ]
        },
        {
            title: 'Company Management',
            items: [
                // {
                //     link: Router.path('companies', {type: 'all'}),
                //     icon: 'business',
                //     title: 'Companies'
                // },
                {
                    link: Router.path('userJobs'),
                    icon: 'view_list',
                    title: 'Jobs'
                },
                {
                    link: Router.path('teams', {visibility: 'public'}),
                    icon: 'group',
                    title: 'Teams'
                },
                {
                    link: Router.path('contracts'),
                    icon: 'insert_drive_file',
                    title: 'Contracts'
                }
            ]
        },
        {
            title: 'Reports',
            items: [
                {
                    link: Router.path('timeTrackerReports'),
                    icon: 'insert_chart',
                    title: 'Reports'
                }
            ]
        }
    ];
});

Template.leftMenu.onRendered(function () {
    $('.button-collapse').on('click', function (e) {
        $(this).toggleClass('open'); //you can list several class names
        e.preventDefault();
    });
    $('.button-collapse').on('click', function (e) {
        $('#slide-out').toggleClass('slided'); //you can list several class names
        e.preventDefault();
    });
    // $('.button-collapse').on('click', function (e) {
    //     $('.tabs-row').toggleClass('slided'); //you can list several class names
    //     e.preventDefault();
    // });
    $('.button-collapse').on('click', function (e) {
        $('.content-section').toggleClass('slided');
        //you can list several class names
        e.preventDefault();
    });
    this.$('.hastip').tooltipsy({
        offset: [10, 0],
        delay: 0,
        css: {
            'padding': '2px 15px',
            'font-size': '12px',
            'font-weight': '500',
            'border-radius': '4px',
            'max-width': '150px',
            'color': '#fff',
            'background-color': '#8b8b8b',
            'text-shadow': 'none'
        }
    });
});


Template.leftMenu.helpers({
    categories: function () {
        var categories = Template.instance().categories;
        return categories;
    },
    fixedMenuItems: function () {
        return [
            {
                link: Router.path('settings'),
                icon: 'settings',
                title: 'Settings'
            },
            {
                link: '#',
                icon: 'help',
                title: 'Help & Feedback'
            }
        ]
    }
});
