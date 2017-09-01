import { VZ } from '/imports/startup/both/namespace';
import { Skills } from '/imports/api/skills/skills.js';
import './edit-profile-modal.html';

Template.editProfileModal.onCreated(function () {
    var self = this;

    this.location = new ReactiveVar(null);
    this.searchString = new ReactiveVar('');
    this.skillsObject = new ReactiveVar({});
    this.skillsArray = new ReactiveVar([]);
    this.ready = new ReactiveVar(false);

    this.getNormalLocation = function (geoObj) {
        var result = {};

        result.coordinates = typeof(geoObj.geometry.location.lat) === 'function'
            ? {lat: geoObj.geometry.location.lat(), lng: geoObj.geometry.location.lng()}
            : {lat: geoObj.geometry.location.lat, lng: geoObj.geometry.location.lng};


        _.each(geoObj.address_components, function (component) {
            result[component.types[0]] = component.long_name;
        });

        return result
    };
    this.transformSkills = function (skills) {
        var nullArray = [];
        var labelArray = _.map(skills, function (skill) {
            return skill.label.toString();
        });
        _.each(labelArray, function (label) {
            nullArray.push(null);
        });
        var skillsObject = _.object(labelArray, nullArray);
        self.skillsObject.set(skillsObject);
    };

    this.autorun(function () {
        var searchString = self.searchString.get();
        var sub = self.subscribe('userSkillsByRegEx', searchString);
        if(sub.ready()){
            self.ready.set(true);
        }
    });
    this.autorun(function () {
        var ready = self.ready.get();
        if(ready){
            if(Meteor.user().profile && Meteor.user().profile.skills && Meteor.user().profile.skills.length > 0){
                var userSkills = Skills.find({_id: {$in: Meteor.user().profile.skills}}).fetch();
                var skillsArrayValue = _.map(userSkills, function (skill) {
                    return {tag: skill.label};
                });
                self.skillsArray.set(skillsArrayValue);
            }
        }
    });
    this.autorun(function () {
        var searchString = self.searchString.get();
        var searchParams = {};
        if (searchString != '') {
            var searchStringRegExp = new RegExp(searchString, 'ig');
            searchParams.label = {$regex: searchStringRegExp};
        } else {
            searchParams.label = 'no-skill';
        }
        var skills = Skills.find(searchParams).fetch();
        self.transformSkills(skills);
    });
});
Template.editProfileModal.onRendered(function () {
    var self = this;
    this.$('.modal').modal();
    this.$('.modal').modal('open');
    this.$('select').material_select();

    this.autorun(function () {
        var skillsObject = self.skillsObject.get();
        var searchString = self.searchString.get();
        var skillsArray = self.skillsArray.get();
        self.$('.chips-autocomplete').material_chip({
            data: skillsArray,
            autocompleteOptions: {
                data: skillsObject,
                limit: 5,
                minLength: 1
            },
            placeholder: 'Skills',
            secondaryPlaceholder: 'Skills'
        });
        self.$('.chips input').val(searchString);
        self.$('.chips input').focus();
    });

    self.$('.chips').on('chip.add', function(e, chip){
        var skillsArray = self.skillsArray.get();
        function isEqual(element) {
            return element.tag == chip.tag;
        }
        var index = skillsArray.findIndex(isEqual);
        if(index == -1){
            skillsArray.push(chip);
        }
    });

    self.$('.chips').on('chip.delete', function(e, chip){
        var skillsArray = self.skillsArray.get();
        function isEqual(element) {
            return element.tag == chip.tag;
        }
        var index = skillsArray.findIndex(isEqual);
        if(index != -1){
            skillsArray.splice(index, 1);
        }
    });
    GoogleMaps.load({
        v: '3', key: Meteor.settings.public.MAPS_API_KEY, libraries: 'geometry,places',
        language: 'en'
    });
    if (Meteor.user().profile && Meteor.user().profile.location) {
        var location = Meteor.user().profile.location;
        self.location.set(location);
    }
    this.autorun(function () {
        if (GoogleMaps.loaded()) {
            self.$('#location').geocomplete().bind('geocode:result', function (e, res) {
                self.location.set(self.getNormalLocation(res));
            });
        }
    });
    $('.lean-overlay').on('click', function () {
        removeTemplate(self.view);
    });
    document.addEventListener('keyup', function (e) {
        if (e.keyCode == 27) {
            removeTemplate(self.view);
        }
    });
});
Template.editProfileModal.onDestroyed(function () {
    $('.lean-overlay').remove();
});

Template.editProfileModal.helpers({
    formatSkills: function (skills) {
        return skills.toString().replace(/,/g, ', ');
    },

    isSelected: function (availability) {
        var userAvailability = Template.instance().data.profile.availabilityTime;
        return userAvailability == availability ? 'selected' : '';
    },

    isChecked: function () {
        var getInvitations = Template.instance().data.profile.getInvitations;
        return getInvitations == true ? 'checked' : '';
    }
});

Template.editProfileModal.events({
    'click .save': function (event, tmpl) {
        event.preventDefault();
        var firstName = tmpl.$('#first-name').val().trim();
        var lastName = tmpl.$('#last-name').val().trim();
        var overview = tmpl.$('#overview').val().trim() || '';
        var location = tmpl.location.get();
        var skills = tmpl.$('.chips-autocomplete').material_chip('data');
        var skillsTags = _.map(skills, function (skill) {
            return skill.tag;
        });

        var hourlyRate = tmpl.$('#hourly-rate').val().trim();
        var availabilityTime = tmpl.$('#availability').val().trim();
        var getInvitations = tmpl.$('#get-invitations').prop('checked');
        if (_.isEmpty(firstName) || _.isEmpty(lastName) || _.isEmpty(overview) || _.isEmpty(location) || _.isEmpty(skills) || _.isEmpty(hourlyRate) || _.isEmpty(availabilityTime)) {
            $('.toast').hide();
            VZ.notify('Complete all fields', 5000);
            return;
        }

        var user = {
            firstName: firstName,
            lastName: lastName,
            overview: overview,
            location: location,
            skills: skillsTags,
            hourlyRate: hourlyRate,
            availabilityTime: availabilityTime,
            getInvitations: getInvitations
        };

        tmpl.data.onUserEdit(user);
        tmpl.$('#edit-profile-modal').modal('close');
        removeTemplate(tmpl.view);
    },
    'click .cancel': function (event, tmpl) {
        event.preventDefault();
        tmpl.$('#edit-profile-modal').modal('close');
        removeTemplate(tmpl.view);
    },
    'input .chips': _.throttle(function (event, tmpl) {
        event.preventDefault();
        var searchString = event.target.value.trim();
        tmpl.searchString.set(searchString);
    }, 300)
});

var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};