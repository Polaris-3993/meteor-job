import { VZ } from '/imports/startup/both/namespace';
import { Countries } from '/imports/api/countries/countries';
import './worker-location.html';

Template.workerLocation.onCreated(function () {
    var workerLocation = this.data && this.data.job && this.data.job.workerLocation;
    var continent = workerLocation && this.data.job.workerLocation.continent || '';
    var isCountriesDisabled = workerLocation && this.data.job.workerLocation.country == 'anywhere' ? true : false;

    this.continentCode = new ReactiveVar(continent);
    this.isCountriesDisabled = new ReactiveVar(isCountriesDisabled);
});
Template.workerLocation.onRendered(function () {
    var self = this;
    $('#continent').material_select();
    $('#country').material_select();
    $('input.location').click(function () {
        $('input:not(:checked)').parent().removeClass('active');
        $('input:checked').parent().addClass('active');
    });
    this.autorun(function () {
        self.continentCode.get();
        self.isCountriesDisabled.get();
        Tracker.afterFlush(function () {
            $('#country').material_select();
        });

    });
});
Template.workerLocation.helpers({
    isRestricted: function (restricted) {
        if (this.job && this.job.workerLocation && this.job.workerLocation) {
            var isJobRestricted = this.job.workerLocation.isRestricted;
            var contract = isJobRestricted ? 'restricted' : 'anywhere';

            if (contract == restricted) {
                return 'checked';
            }
            else {
                return '';
            }
        }
        else {
            return '';
        }
    },
    isActive: function (restricted) {
        if (this.job && this.job.workerLocation && this.job.workerLocation.isRestricted) {
            var isJobRestricted = this.job.workerLocation.isRestricted;
            var contract = isJobRestricted ? 'restricted' : 'anywhere';

            if (contract == restricted) {
                return 'active';
            }
            else {
                return '';
            }
        }
        else {
            return '';
        }
    },
    countries: function () {
        var tmpl = Template.instance();
        var continentCode = tmpl.continentCode.get();
        return Countries.find({continentCode: continentCode}).fetch() || [];
    },
    selectedContinent: function (continent) {
        if (this.job) {
            var jobContinent = this.job && this.job.workerLocation && this.job.workerLocation.continent;
            if (continent == jobContinent) {
                return 'selected';

            }
            else {
                return '';
            }
        }
        else {
            return '';
        }
    },
    selectedCountry: function (country) {
        var tmpl = Template.instance();
        if(tmpl.data && tmpl.data.job && tmpl.data.job.workerLocation && tmpl.data.job.workerLocation.country){
            var jobCountry = tmpl.data.job.workerLocation.country;
            if (jobCountry == country) {
                return 'selected';
            }
            else {
                return '';
            }
        }
        else {
            return '';
        }

    },
    isRestrictedCountry: function () {
        var tmpl = Template.instance();
        if(tmpl.data && tmpl.data.job && tmpl.data.job.workerLocation && tmpl.data.job.workerLocation.country){
            var jobCountry = tmpl.data.job.workerLocation.country;
            if (jobCountry == 'anywhere') {
                return 'checked';
            }
            else {
                return '';
            }
        }
        else {
            return '';
        }
    },
    isCountriesDisabled: function () {
        var tmpl = Template.instance();
        return tmpl.isCountriesDisabled.get();
    }
});
Template.workerLocation.events({
    'click .discard': function (event, tmpl) {
        event.preventDefault();
        var id = this.job._id;
        Router.go('editJob', {id: id});
    },
    'click .next': function (event, tmpl) {
        event.preventDefault();
        var job = {};
        var jobId = this.job._id;
        var contractType = tmpl.$('input[name="worker-location"]:checked').val();
        if (!contractType) {
            VZ.notify('Select location');
            return;
        }
        if (contractType == 'anywhere') {
            job.workerLocation = {
                isRestricted: false
            };
        }
        else if (contractType == 'restricted') {
            var continent = tmpl.$('#continent').val();
            job.workerLocation = {
                isRestricted: true,
                continent: continent
            };
            var country = tmpl.$('#country').val();
            var isCountryRestricted = !tmpl.$('#filled-in-box').prop('checked');
            if (!isCountryRestricted) {
                job.workerLocation.country = 'anywhere';
            } else if (isCountryRestricted) {
                job.workerLocation.country = country;

            }
        }
        if (jobId) {
            Meteor.call('editWorkerLocation', job, jobId, function (error, result) {
                if (error) {
                    var message = error.reason || error.message;
                    VZ.notify(message.replace('Match error: Match error: Match error: ', ''));
                }
                else {
                    Router.go('jobOverview', {id: jobId});
                }
            });
        }
    },
    'change #continent': function (event, tmpl) {
        var continent = tmpl.$('#continent').val();
        tmpl.continentCode.set(continent);
        $('#country').material_select();
    },
    'change #filled-in-box': function (event, tmpl) {
        tmpl.isCountriesDisabled.set(event.target.checked);
    }
});