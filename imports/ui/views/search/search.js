import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Projects } from '/imports/api/projects/projects';
import { Tasks } from '/imports/api/tasks/tasks';
import { Tools } from '/imports/api/tools/tools';
import { Workplaces } from '/imports/api/workPlaces/workPlaces';
import { Companies } from '/imports/api/companies/companies';
import { Teams } from '/imports/api/teams/teams';

import './search.html';
import './tabs/all/all-search';
import './tabs/companies/companies-search';
import './tabs/projects/project-search';
import './tabs/tab-header/search-tab-header';
import './tabs/tasks/tasks-search';
import './tabs/teams/teams-search';
import './tabs/timetracker/timetracker-search';
import './tabs/tools/tools-search';
import './tabs/users/users-search';
import './tabs/workspaces/workspaces-search';

Template.search.onCreated(function () {
    var self = this;
    this.tabs = [{
        title: 'ALL',
        template: 'allSearch'
    }, {
        title: 'COMPANIES',
        template: 'companiesSearch',
        collection: Companies.find({})
    }, {
        title: 'PROJECTS',
        template: 'projectsSearch',
        collection: Projects.find({})
    }, {
        title: 'TASKS',
        template: 'tasksSearch',
        collection: Tasks.find({})
    },{
        title: 'TIMETRACKER',
        template: 'timetrackerSearch',
        collection: TimeEntries.find({})
    }, {
        title: 'TOOLS',
        template: 'toolsSearch',
        collection: Tools.find({})
    }, {
        title: 'USERS',
        template: 'usersSearch',
        collection: Meteor.users.find({
            _id: {
                $ne: Meteor.userId()
            }
        })
    }, {
        title: 'WORKSPACES',
        template: 'workplacesSearch',
        collection: Workplaces.find({})
    }, {
        title: 'TEAMS',
        template: 'teamsSearch',
        collection: Teams.find({})
    }];

    this.activeTab = new ReactiveVar(this.tabs[0].template);

    this.autorun(function () {

        var activeTab = self.activeTab.get();
        var searchString = Template.currentData().searchString.get();

        if (activeTab === 'allSearch') {
            self.subscribe('allSearch', searchString);
        }
        else {
            self.subscribe('searchTab', searchString, activeTab);
        }
    })
});

Template.search.onRendered(function () {
});

Template.search.helpers({
    tabs: function () {
        var tabs = Template.instance().tabs;
        $('.tabs').tabs();
        return _.reject(tabs, function (tab) {
            if (tab.collection) {
                return tab.collection.count() == 0
            }
            return false
        })
    },

    activeTab: function () {
        return Template.instance().activeTab.get();
    },

    allSearchData: function () {
        var tabs = Template.search.__helpers.get('tabs').call();
        return {
            pageParams: this,
            tabs: tabs.slice(1)
        }
    },

    isAllSearch: function (activeTab) {
        return activeTab === 'allSearch'
    },

    isHaveSearchResults: function () {
        var tabs = Template.instance().tabs;
        var flag = false;
        _.each(tabs, function (tab) {
            if(tab.collection && tab.collection.count() > 0){
                flag = true
            }
        });

        return flag;
    }
});

Template.search.events({
    'click .tab': function (event, tmpl) {
        event.preventDefault();
        var selectedTabName = $(event.currentTarget).attr('id');
        tmpl.activeTab.set(selectedTabName);
    }
});
