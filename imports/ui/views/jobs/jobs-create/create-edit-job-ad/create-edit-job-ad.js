import { VZ } from '/imports/startup/both/namespace';
import { Skills } from '/imports/api/skills/skills';
import { JobCategories } from '/imports/api/jobCategories/jobCategories';
import { JobTypes } from '/imports/api/jobTypes/jobTypes';
import { JobsSchema } from '/imports/api/jobs/jobs';

import './create-edit-job-ad.html';
import './job-description-editor/job-description-editor';
import './job-location/job-location';
import './phone-edit/phone-edit';
import './skills/skills';

Template.createEditJobAd.onCreated(function () {
    var self = this;
    this.createOrEditJob = _.debounce(function (document) {
        if (self.data && self.data.job) {
            document._id = self.data.job._id;
            Meteor.call('editJob', document, function (err, res) {
                if (err) {
                    var message = err.reason || err.message;
                    self.getInvalidId(message);
                } else {
                    Router.go('previewJob', {id: document._id});
                }
            });
        } else {
            Meteor.call('createJob', document, function (err, res) {
                if (err) {
                    var message = err.reason || err.message;
                    self.getInvalidId(message);
                } else {
                    Router.go('previewJob', {id: res});
                }
            });
        }
    }, 1000, true);
    this.getInvalidId = function (message) {
        var regEx = /(<id>([\w-]+)<\/id>)/gi;
        var group = regEx.exec(message);
        var invalidId = group[2].trim();

        if (invalidId == 'category' || invalidId == 'job-type' || invalidId == 'description') {
            $('body').animate({
                scrollTop: ($('.' + invalidId).offset().top)
            }, 400);
        } else {
            self.$('#' + invalidId).focus();
        }
        if (!_.contains(self.notValidIds.array(), invalidId)) {
            self.notValidIds.push(invalidId);
        }
        message = message.replace(invalidId, '');
        VZ.notify(message.replace(/Match error: /g, ''));
    };
    this.isValid = function (valid, key, id) {
        if (!valid) {
            if (!_.contains(self.notValidIds.array(), id)) {
                self.notValidIds.push(id);
            }
            var errorMessage = JobsSchema.namedContext().keyErrorMessage(key);
            errorMessage = errorMessage.replace(id, '');
            VZ.notify(errorMessage.replace(/keyErrorMessage: /g, ''));
        }
        else {
            self.notValidIds.remove(id);
        }
    };
    this.validateInput = function (id, value, $input) {
        var getObject = function (id) {
            var obj = {};
            switch (id) {
                case 'title':
                    obj['title'] = value;
                    break;
                case 'country-input':
                    var list = $input.attr('list'),
                        match = $('#' + list + ' option').filter(function () {
                            return ($(this).val() === value);
                        });
                    if (match.length > 0) {
                        obj['countryCode'] = match[0].id;
                    } else {
                        obj['countryCode'] = value;
                    }
                    break;
                case 'job-location-city':
                    obj['city'] = value;
                    break;
                case 'salary-min':
                    obj['salary.min'] = parseInt(value);
                    break;
                case 'salary-max':
                    obj['salary.max'] = parseInt(value);
                    break;
                case 'equity-range-min':
                    obj['equity.min'] = parseInt(value);
                    break;
                case 'equity-range-max':
                    obj['equity.max'] = parseInt(value);
                    break;
                case 'year-vest':
                    obj['equity.yearVest'] = parseInt(value);
                    break;
                case 'year-cliff':
                    obj['equity.yearCliff'] = parseInt(value);
                    break;
                case 'company-name':
                    obj["companyName"] = value;
                    break;
                case 'headquater-location':
                    obj['headquaterLocation'] = value;
                    break;
                case 'website':
                    obj['website'] = value;
                    break;
                case 'contact-name':
                    obj['name'] = value;
                    break;
                case 'contact-email':
                    obj['email'] = value;
                    break;
                case 'contact-phone':
                    obj['phone'] = value;
                    break;
            }
            return obj;
        };

        if (id == 'contact-name' || id == 'contact-email' || id == 'contact-phone') {
            var contactInfo = getObject(id);
            var contactKey = _.keys(contactInfo)[0];
            contactKey = 'contactInfo.' + contactKey;
            var contactValid = JobsSchema.namedContext().validateOne({contactInfo}, contactKey);
            self.isValid(contactValid, contactKey, id);
        }
        else if (id == 'country-input' || id == 'job-location-city') {
            var location = getObject(id);
            var locationKey = _.keys(location)[0];
            locationKey = "location." + locationKey;
            var locationValid = JobsSchema.namedContext().validateOne({location}, locationKey);
            self.isValid(locationValid, locationKey, id);
        }
        else {
            var validateObj = getObject(id);
            var key = _.keys(validateObj)[0];
            var valid = JobsSchema.namedContext().validateOne(validateObj, key);
            self.isValid(valid, key, id);
        }
    };

    // Reactive vars - start
    var selectedCategoryId = this.data && this.data.job && this.data.job.categoryId
        ? this.data.job.categoryId : null;
    this.selectedCategoryId = new ReactiveVar(selectedCategoryId);

    var selectedCurrency = this.data && this.data.job && this.data.job.salary
        ? this.data.job.salary.currency : 'usd';
    this.selectedCurrency = new ReactiveVar(selectedCurrency);

    var isAvailableAnywhere = this.data && this.data.job && this.data.job.employeeOriginCountry ?
        false : true;
    this.isAvailableAnywhere = new ReactiveVar(isAvailableAnywhere);

    var location = this.data && this.data.job && this.data.job.location ?
        this.data.job.location : {};
    this.location = new ReactiveVar(location);

    var selectedSkillsIds = this.data && this.data.job && this.data.job.skillsIds
        ? this.data.job.skillsIds : [];
    this.selectedSkillsIds = new ReactiveArray(selectedSkillsIds);
    this.notValidIds = new ReactiveArray();
    // Reactive vars - end
});

Template.createEditJobAd.onRendered(function () {
    var self = this;
    this.$('input#title').characterCounter();
    this.$('input#company-name').characterCounter();
    this.$('input#headquater-location').characterCounter();
    this.$('input#website').characterCounter();
    this.$('input#contact-name').characterCounter();
    this.$('input#contact-email').characterCounter();


    this.$('#category').material_select();
    this.$('#job-type').material_select();
    this.$('#skills-select').material_select();
    this.$('#salary-currency').material_select();

    this.autorun(function () {
        var array = self.notValidIds.array();
        Tracker.afterFlush(function () {
            self.$('#category').material_select();
            self.$('#job-type').material_select();
        });

    });
});

Template.createEditJobAd.onDestroyed(function () {
});

Template.createEditJobAd.helpers({
    categories: function () {
        return JobCategories.find();
    },
    'currencies': function () {
        return [{
            label: 'USD',
            value: 'usd'
        }, {
            label: 'GBP',
            value: 'gbp'
        }, {
            label: 'EURO',
            value: 'euro'
        }]
    },
    'jobTypes': function () {
        return JobTypes.find();
    },
    selectedCategoryId: function () {
        var tmpl = Template.instance();
        return tmpl.selectedCategoryId.get();
    },
    selectedSkillsIds: function () {
        var tmpl = Template.instance();
        return tmpl.selectedSkillsIds.list().array();
    },
    'addSkillCb': function () {
        var tmpl = Template.instance();

        return function (skillId) {
            tmpl.selectedSkillsIds.push(skillId);
        }
    },
    'removeSkillCb': function () {
        var tmpl = Template.instance();

        return function (skillId) {
            tmpl.selectedSkillsIds.remove(function (currSkillId) {
                return currSkillId == skillId;
            });
        }
    },
    'selectedCurrency': function () {
        return Template.instance().selectedCurrency.get();
    },

    'isAvailableAnywhere': function () {
        return Template.instance().isAvailableAnywhere.get();
    },

    'selectedLocation': function () {
        return Template.instance().location.get();
    },
    'changeLocationCb': function () {
        var tmpl = Template.instance();

        return function (newLocation) {
            tmpl.location.set(newLocation);
        };
    },
    isValidInput: function (currentId) {
        var notValidIds = Template.instance().notValidIds.array();
        if (currentId) {
            return _.contains(notValidIds, currentId);
        }
        else {
            return function (id) {
                return _.contains(notValidIds, id);
            };
        }
    }
});

Template.createEditJobAd.events({
    'submit #jobs-form': function (event, tmpl) {
        var getValuesFromForm = function () {
            var title = tmpl.$('#title').val();
            var categoryId = tmpl.selectedCategoryId.get();
            var jobTypesIds = tmpl.$('#job-type').val();
            var location = tmpl.location.get();
            var selectedSkillsIds = tmpl.selectedSkillsIds.array();
            var isAvailableAnywhere = tmpl.isAvailableAnywhere.get();
            var skills = tmpl.$('#skills').val();
            var employeeOriginCountry = tmpl.$('#employee-origin-country').val(); // optional
            var visaSponsorship = tmpl.$('[name="visa-sponsorship"]:checked()').prop('id');
            var salaryMin = tmpl.$('#salary-min').val();
            var salaryMax = tmpl.$('#salary-max').val();
            var salaryCurrency = tmpl.selectedCurrency.get();

            var equityMin = tmpl.$('#equity-range-min').val();
            var equityMax = tmpl.$('#equity-range-max').val();
            var yearVest = tmpl.$('#year-vest').val();
            var yearCliff = tmpl.$('#year-cliff').val();

            var description = tinyMCE.get('description').getContent({format: 'raw'});

            var companyName = tmpl.$('#company-name').val();
            var headquaterLocation = tmpl.$('#headquater-location').val();

            var website = tmpl.$('#website').val();
            var contactName = tmpl.$('#contact-name').val();
            var contactPhone = tmpl.$('#contact-phone').intlTelInput('getNumber');
            var contactEmail = tmpl.$('#contact-email').val();

            var jobDocument = {
                title: title,
                categoryId: categoryId,
                jobTypesIds: jobTypesIds,
                location: location,
                skillsIds: selectedSkillsIds,
                isVisaSponsorshipEnabled: visaSponsorship == 'visa-yes',
                isAvailableAnywhere: isAvailableAnywhere,
                description: description,
                companyName: companyName,
                headquaterLocation: headquaterLocation,
                website: website,
                contactInfo: {
                    name: contactName,
                    phone: contactPhone,
                    email: contactEmail
                }
            };

            if (!isAvailableAnywhere) {
                jobDocument.employeeOriginCountry = employeeOriginCountry;
            }

            if (salaryMin || salaryMax) {
                jobDocument.salary = {
                    currency: salaryCurrency
                };

                if (salaryMin) {
                    jobDocument.salary.min = parseInt(salaryMin);
                }
                if (salaryMax) {
                    jobDocument.salary.max = parseInt(salaryMax);
                }
            }

            if (equityMin || equityMax || yearVest || yearCliff) {
                jobDocument.equity = {};

                if (equityMin) {
                    jobDocument.equity.min = parseInt(equityMin);
                }
                if (equityMax) {
                    jobDocument.equity.max = parseInt(equityMax);
                }
                if (yearVest) {
                    jobDocument.equity.yearVest = parseInt(yearVest);
                }
                if (yearCliff) {
                    jobDocument.equity.yearCliff = parseInt(yearCliff);
                }
            }
            return jobDocument;
        };

        event.preventDefault();

        var document = getValuesFromForm();
        try {
            check(document, JobsChecker);
            tmpl.createOrEditJob(document);
        } catch (error) {
            var message = error.reason || error.message;
            tmpl.getInvalidId(message);
        }
    },

    'click #delete-button': function (event, tmpl) {
        Meteor.call('archiveJob', tmpl.data.job._id);
    },

    'click #cancel-button': function (event, tmpl) {
        Router.go('userJobs');
    },

    'change #category': function (event, tmpl) {
        var id = event.target.id;
        var updateSelectedSkills = function (selectedCategoryId) {
            tmpl.selectedSkillsIds.clear();

            // add required skill after change category
            var category = JobCategories.findOne(selectedCategoryId);
            var requiredSkill = Skills.findOne({relatedJobCategoryId: category._id, isRequired: true});
            tmpl.selectedSkillsIds.push(requiredSkill._id);
        };

        var selectedCategoryId = event.target.selectedOptions[0].value;
        tmpl.selectedCategoryId.set(selectedCategoryId);
        if (selectedCategoryId.length > 0) {
            tmpl.notValidIds.remove(id);
        }
        updateSelectedSkills(selectedCategoryId);
    },
    'change #job-type': function (event, tmpl) {
        event.preventDefault();
        event.stopPropagation();
        var id = event.target.id;
        tmpl.notValidIds.remove(id);
    },
    'change #salary-currency': function (event, tmpl) {
        tmpl.selectedCurrency.set(event.target.value);
    },
    'change #available-anywhere': function (event, tmpl) {
        tmpl.isAvailableAnywhere.set(event.target.checked);
    },
    'blur input': function (event, tmpl) {
        var id = event.target.id;
        var value = event.target.value;
        var $input = $(event.target);
        if (_.contains(tmpl.notValidIds.array(), id) && value.length == 0) {
            tmpl.notValidIds.remove(id);
        }
        else if (value.length > 0) {
            tmpl.validateInput(id, value, $input);
        }
    },
    'invalid input': function (event, tmpl) {
        event.preventDefault();
    }
});