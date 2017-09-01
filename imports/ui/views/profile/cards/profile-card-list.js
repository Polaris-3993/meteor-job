import './profile-card-list.html';
import './biography/biography';
import './education/education';
import './experience/experience';
import './location-card/location-card';
import './portfolio/portfolio';
import './profile-card/profile-card';
import './quick-info/quick-info';
import './skills-card/skills-card';
import './status/status';
import './work-history/work-history';

Template.profileCardList.onCreated(function () {
});

Template.profileCardList.onRendered(function () {
    var $iso;

    $iso = $('.profile-cards').isotope({
        itemSelector: '.profile-card-wrapper',
        layoutMode: 'masonry',
        percentPosition: true,
        masonry: {
            // use element for option
            columnWidth: '.profile-card-wrapper',
            isFitWidth: true
        },
        transitionDuration: '0.2s'
    });

    window.iso = $iso;

    $('body').resize(function (evt) {
        Template.profileCardList.updateMasonry();
    });
});

Template.profileCardList.onDestroyed(function () {
    $('body').off('resize');
});

Template.profileCardList.helpers({

    profileCards: function () {
        var user = Meteor.users.findOne({_id: this.userId});
        var mappedCards;
        var profile, profileMappingRules, bindings;
        var profileKeys;


        if (!user || !user.profile) {
            throw new Meteor.Error('User\'s profile data is not available.');
        }

        profile = user.profile;
        profileKeys = Object.keys(profile);

        profileMappingRules = [

            {
                profileField: 'location',
                label: 'Location'
            }, {
                profileField: 'skills',
                label: 'Skills'
            }, {
                profileField: 'education',
                label: 'Education'
            }, {
                profileField: 'projectsDone',
                label: 'Total projects done'
            }, {
                profileField: 'activeProjects',
                label: 'Active projects'
            }, {
                profileField: 'teamName',
                label: 'Team(s) name'
            }

        ];


        mappedCards = _.map(profileMappingRules, _mapProfileRules);

        function _mapProfileRules(rule, index) {

            var key = rule.profileField;


            if (profile[key] instanceof Array) {
                profile[key] = profile[key].join(', ');
            }

            rule.initValue = profile[key];

            return rule;
        }

        return mappedCards;
    },

    isLocation: function (field) {
        return field == 'location';
    },
    
    isSkills: function (field) {
        return field == 'skills'
    }
});


Template.profileCardList.updateMasonry = function () {

    if (window.iso) {

        var $cardContainer = $('.profile-cards');

        $cardContainer.isotope('layout')
    }
};