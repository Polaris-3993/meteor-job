import './found-entity/found-entity';
import './entity-search.html';

import { Companies } from '/imports/api/companies/companies';
import { Projects } from '/imports/api/projects/projects';

Template.entitySearchForm.onCreated(function () {
    this.searchString = new ReactiveVar('');
    this.isInputFocused = new ReactiveVar(false);
    var self = this;
    // dynamic subscription on users
    // subscribe by typed search string
    self.autorun(function () {
        var searchString = self.searchString.get();

        switch (self.data.entityName) {
            case 'users':
                self.subscribe('usersByNameOrEmailRegExp', searchString, 10);
                break;
            case 'Projects':
                self.subscribe('projectsByNameRegExp', searchString, 10);
                break;
            case 'Companies':
                self.subscribe('companiesByNameRegExp', searchString, 10);
                break;
        }
    });
});

Template.entitySearchForm.helpers({
    foundEntities: function () {
        var tmpl = Template.instance();

        var searchParams = {};
        var excludedEntitesIds = tmpl.data.excludedEntitiesIds || [];
        searchParams._id = {$nin: excludedEntitesIds};

        var availableEntitiesIds = tmpl.data.availableEntitiesIds || [];
        if (availableEntitiesIds.length > 0) {
            searchParams._id.$in = availableEntitiesIds;
        }

        var searchString = tmpl.searchString.get();
        if (searchString != '') {
            var searchStringRegExp = new RegExp(searchString, 'gi');

            if (this.entityName == 'users') {
                searchParams.$or = [
                    {'profile.fullName': {$regex: searchStringRegExp}},
                    {'emails.address': {$regex: searchStringRegExp}}
                ];
            } else {
                searchParams[this.displayedPropertyName] = {$regex: searchStringRegExp}
            }
        }

        if (this.entityName == 'users') {
            return Meteor.users.find(searchParams, {limit: 10});
        } else {
            if(this.entityName == 'Companies'){
                return Companies.find(searchParams, {limit: 10});
            }
            else if(this.entityName == 'Projects'){
                return Projects.find(searchParams, {limit: 10});
            }
        }
    },
    onSelectEntity: function () {
        return Template.instance().data.onSelectEntity;
    },
    isInputFocused: function () {
        var tmpl = Template.instance();
        return tmpl.isInputFocused.get();
    }
});

Template.entitySearchForm.events({
    'input #searchString': _.throttle(function (event, tmpl) {
        event.preventDefault();
        setTimeout(function () {
            var $input = tmpl.$('#searchString');
            var value = $input.val();
            value = value.replace(/[/\\$%^:]/g, '');
            $input.val(value);

            tmpl.searchString.set(value);
        }, 50);
    }, 100),

    'focus #searchString': function (event, tmpl) {
        tmpl.isInputFocused.set(true);

        var value = tmpl.$(event.currentTarget).val();
        if (value && value.trim().length > 0) {
            tmpl.searchString.set(value);
        }
    },
    'blur #searchString': function (event, tmpl) {
        tmpl.isInputFocused.set(false);
    },

    'click .cancel-add-assignedUser-icon': function (event, tmpl) {
        tmpl.isInputFocused.set(false);
        tmpl.searchString.set('');
        tmpl.$('#searchString').val('');

    }
});
