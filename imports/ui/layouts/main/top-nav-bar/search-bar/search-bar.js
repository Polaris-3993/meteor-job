import './search-bar.html';

Template.searchBar.onCreated(function () {
    var self = this;
    this.inputFocused = new ReactiveVar(false);
    this.searchString = new ReactiveVar();
    this.searchHistoryValid = new ReactiveVar([]);

    this.autorun(function () {
        var searchHistory = Meteor.user() && Meteor.user().profile && Meteor.user().profile.searchHistory;
        var searchString = self.searchString.get();

        if (searchHistory) {
            if (searchString && searchString.length > 0) {
                var regExp = new RegExp(searchString, 'i');

                searchHistory = _.filter(searchHistory, function (item) {
                    return regExp.test(item);
                });
                self.searchHistoryValid.set(searchHistory.slice(-5));

            } else {
                self.searchHistoryValid.set(searchHistory.slice(-5));
            }
        }
    });

    this.formatQuery = function (value, pageTitle) {
        value = value.trim();
        var query = 'q=' + value;

        if (pageTitle === 'timetracker' || pageTitle === 'workspaces' || pageTitle === 'companies' ||
            pageTitle === 'projects' || pageTitle === 'tools' || pageTitle === 'users' || pageTitle === 'tasks') {

            query = query + '&c=' + pageTitle
        }

        return query;
    };
});

Template.searchBar.onRendered(function () {
    var self = this;

    // clear search input when go away from search page
    this.autorun(function () {
        var routeName = Router.current().route.getName();
        if (routeName != 'searchPage') {
            self.$('#search').val('');
        }
    });
});

Template.searchBar.helpers({
    inputFocused: function () {
        return Template.instance().inputFocused.get();
    },

    searchHistory: function () {
        return Template.instance().searchHistoryValid.get();
    }
});

Template.searchBar.events({
    'submit #search-form': function (event, tmpl) {
        event.preventDefault();
        var $input = tmpl.$('#search');
        var value = $input.val();
        var pageTitle = tmpl.data.pageTitle.toLowerCase();

        var query = tmpl.formatQuery(value, pageTitle);

        if (value.trim().length > 0) {
            Meteor.call('addSearchQuery', value, function (err) {
                if (err) {
                    console.log(err);
                }
            });

            $input.blur();
            Router.go('searchPage', {}, {query: query})
        }
    },

    'input #search': function (event, tmpl) {
        var value = tmpl.$(event.currentTarget).val();

        if (value.trim().length > 0) {
            tmpl.searchString.set(value);
        } else {
            tmpl.searchString.set();
        }
    },

    'focus #search': function (event, tmpl) {
        tmpl.inputFocused.set(true);

        var value = tmpl.$(event.currentTarget).val();
        if (value && value.trim().length > 0) {
            tmpl.searchString.set(value);
        }
    },

    'blur #search': function (event, tmpl) {
        tmpl.inputFocused.set(false);
    },

    'mousedown .search-history-item': function (event, tmpl) {
        var value = this.toString();
        var pageTitle = tmpl.data.pageTitle.toLowerCase();

        var query = tmpl.formatQuery(value, pageTitle);

        tmpl.$('#search').val(value);
        Router.go('searchPage', {}, {query: query})
    }
});