import { Projects } from '/imports/api/projects/projects';
import { Notifications } from '/imports/api/notifications/notifications';
import { Companies } from '/imports/api/companies/companies';
import { VZ } from '/imports/startup/both/namespace';
import './dropdown-container/dropdown-container';
import './search-bar/search-bar';
import './top-nav-bar.html';
import { projectsSubs } from '/imports/startup/client/subManagers';
import { timeEntriesSubs } from '/imports/startup/client/subManagers';

Template.topNavBar.onCreated(function () {
    var self = this;
    this.unreadNotificationsCount = new ReactiveVar();
    this.notificationsChanged = new ReactiveVar(true);
    this.unreadedNotificationsIds = new ReactiveVar([]);
    this.inputFilter = new ReactiveVar('');

    this.autorun(function () {
        self.notificationsChanged.get();
        Notifications.find().count();
        Meteor.call('unreadNotificationsCount', function (err, res) {
            if (err) {
                console.log(err);
            } else {
                self.unreadNotificationsCount.set(res);
            }
        });
    });
    this.autorun(function () {
        self.notificationsChanged.get();
        Notifications.find().count();
        var subscription = self.subscribe('unreadNotifications');
        if(subscription.ready()){
            var unreadedNotifications =  Notifications.find({isReaded: false}, {sort: {createdAt: -1}, limit: 5}).fetch();
            var unreadedNotificationsIds = _.map(unreadedNotifications, function (notification) {
               return notification._id;
            });
            self.unreadedNotificationsIds.set(unreadedNotificationsIds);
        }
   });
   //  this.autorun(function () {
   //     self.subscribe('Companies', {isArchived: false}, {sort: {name: 1}});
   //  });
});

Template.topNavBar.onRendered(function () {
    var self = this;
    this.$('ul.tabs').tabs();
    $('.dropdown-button').dropdown();
    // $('.collapsible').collapsible();
    this.$('select').material_select();
    $(document).on('click', 'li.action .dropdown-content', function (e) {
        e.stopPropagation();
    });
    $(document).on('click', '#user-switch-dropdown', function (e) {
        e.stopPropagation();
    });
    this.autorun(function () {
        var query = {isArchived: false};
        var subscription = self.subscribe('Companies', query, {sort: {name: 1}});
        if(subscription.ready()){
            self.$('.collapsible').collapsible();
        }
    });
});

Template.topNavBar.helpers({
    profilePhoto: function () {
        var user = Meteor.user();
        if (!user || !user.profile) {
            return;
        }
        if (!user.profile.photo || !user.profile.photo.small) {
            return '/images/default-lockout.png'
        }

        return user.profile.photo.small;
    },

    unreadNotificationsCount: function () {
        return Template.instance().unreadNotificationsCount.get();
    },
    pageTitle: function () {
        var pageTitle = this.pageTitle;
        var routeName = Router.current().route.getName();
        if(routeName == 'projectDashboard'){
            var projectId = Router.current().params.id;
            var project = Projects.findOne(projectId);
            if(project){
                var projectName = project && project.name;
                return 'Projects > ' + projectName;
            }
        }
        else {
            return pageTitle;
        }
    },
    unreadNotifications: function () {
        return Notifications.find({isReaded: false}, {sort: {createdAt: -1}, limit: 5}).fetch();
    },
    userCompanies: function () {
        var query = {isArchived: false};
        var tmpl = Template.instance();
        var inputFilter = tmpl.inputFilter.get();
        if(inputFilter && inputFilter.length > 0){
            var regEx = new RegExp(inputFilter, 'gi');
            query.name = {$regex: regEx}
        }
        var companies = Companies.find(query, {sort: {name: 1}}).fetch();
        return companies;
    },
    selectedCompany: function () {
        var userRole = Session.get('user-role');
        return userRole === 'company';
    },
    firstChar: function () {
        var company = this;
        return company && company.name.charAt(0);
    },
    companyName: function () {
        var companyId = Session.get('companyId');
        var company = Companies.findOne({_id: companyId});
        return company && company.name;
    }
});
Template.topNavBar.onRendered(function () {

});
Template.topNavBar.events({
    'click .navbar-conversations-menu': function (event, tmpl) {
        event.preventDefault();
        var parentNode = tmpl.$(event.target).closest('li')[0];
        Blaze.renderWithData(Template.topNavBarDropdownContainer, {
            templateToDisplay: 'conversationsDropdownContent'
        }, parentNode);
    },

    'click .btn-logout': function () {
        Accounts.logout();
    },
    'click #notification-dropdown': function (event, tmpl) {
        event.stopPropagation();
    },
    'click .setting': function (event, tmpl) {
        event.preventDefault();
    },
    'click #mark-as-read': function (event, tmpl) {
        event.preventDefault();
        var id = [this._id];
        var notificationsChanged = tmpl.notificationsChanged.get();
        Meteor.call('markNotifications', id, function (err, res) {
            if(err){
                console.log(err);
                VZ.notify('Failed to mark notification');
            } else {
                tmpl.notificationsChanged.set(!notificationsChanged);
                VZ.notify('Notification read');
            }
        });
    },
    'click #clear-all-notifications': function (event, tmpl) {
        event.preventDefault();
        var unreadedNotificationsIds = tmpl.unreadedNotificationsIds.get() || [];
        var notificationsChanged = tmpl.notificationsChanged.get();

        Meteor.call('markNotifications', unreadedNotificationsIds, function (err, res) {
            if(err){
                console.log(err);
                VZ.notify('Failed to mark notification');
            } else {
                tmpl.notificationsChanged.set(!notificationsChanged);
                VZ.notify('Notification read');
            }
        });
    },
    'click #workers-view': function (event, tmpl) {
        event.preventDefault();
        Session.set('user-role', 'user');
        Session.set('companyId', '');
    },
    'input #filter-company': function (event, tmpl) {
        event.preventDefault();
        var str = tmpl.$('#filter-company').val();
        tmpl.inputFilter.set(str.trim());
    },
    'click #company': function (event, tmpl) {
        event.preventDefault();
        var company = this;
        timeEntriesSubs.clear();
        projectsSubs.clear();
        // $('.dropdown-button').dropdown('close');
        Session.set('user-role', 'company');
        Session.set('companyId', company._id);

    }
});