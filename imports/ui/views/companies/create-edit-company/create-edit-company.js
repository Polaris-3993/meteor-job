import { VZ } from '/imports/startup/both/namespace';
import { Countries } from '/imports/api/countries/countries';
import './create-edit-company.html';

Template.createEditCompany.onCreated(function () {
    var workersIds = this.data && this.data.company ?
        this.data.company.workersIds : [];
    var workers = _.map(workersIds, function (workerId) {
        return {
            _id: workerId
        }
    });
    this.workers = new ReactiveArray(workers);

    this.mapOptions = new ReactiveVar({});

    this.updateMapOptions = function (key, value) {
        var params = this.mapOptions.get() || {};

        if (!value) {
            params = _.omit(params, key);
        } else {
            params[key] = value;
        }
        this.mapOptions.set(params);
    };

    this.requiredFieldsIsEmptyNotifyDebounced = _.debounce(function (message) {
        VZ.notify(message);
    }, 500, true);

    this.isCountrySelected = new ReactiveVar(false);

    this.isCompanyNameUnique = new ReactiveVar(true);
    this.isAllInputsValid = new ReactiveVar(false);

    if (this.data.company) {
        this.isAllInputsValid.set(true);
        this.isCountrySelected.set(true);
    }
});

Template.createEditCompany.onRendered(function () {
    $('.modal-trigger').modal();
    var self = this;
    var location = {};
    if (this.data.company && this.data.company.location) {
        location = this.data.company.location;
        _.each(location, function (val, key) {
            self.updateMapOptions(key, val);
        });
    }


    this.$('#country').material_select();
});

Template.createEditCompany.helpers({
    assignedUsers: function () {
        return Template.instance().workers.list();
    },

    mapOptions: function () {
        var options = Template.instance().mapOptions.get();
        return options;
    },
    isShowMap: function () {
        var options = Template.instance().mapOptions.get();
        return _.has(options, 'country') && _.has(options, 'city')
            && _.has(options, 'address') && _.has(options, 'zip');
    },

    canBeSubmitted: function () {
        var tmpl = Template.instance();
        return tmpl.isAllInputsValid.get() && tmpl.isCompanyNameUnique.get();
    },

    isCountrySelected: function () {
        return Template.instance().isCountrySelected.get();
    },

    countriesList: function () {
        return Countries.find({},{sort:{label: 1}}).fetch();//['USA', 'Ukraine', 'Russia', 'Germany', 'United Kingdom'];
    },
    
    isEditState: function () {
        return this && this.company
    }
});

Template.createEditCompany.events({
    'click .cancel-company-deleting': function (event, tmpl) {
        tmpl.$('#deleteCompanyModal').modal('close');
    },
    
    'click .delete-company': function (event, tmpl) {
        tmpl.$('#deleteCompanyModal').modal('close');
        var companyId = tmpl.data.company._id;
        Meteor.call('archiveCompany', companyId, function (err) {
            if (err) {
                VZ.notify(err);
            } else {
                VZ.notify('Company archived');
                Router.go('companies');
            }
        });
    },
    
    'click #cancel-button': function (event, tmpl) {
        event.preventDefault();
        if (tmpl.data.company) {
            Router.go('companyDetail', {id: tmpl.data.company._id});
        } else {
            Router.go('companies', {type: 'all'});
        }
    },
    'submit #editCompanyForm': _.debounce(function (event, tmpl) {
        var getCompanyDocument = function () {
            var companyId = tmpl.data && tmpl.data.company ? tmpl.data.company._id : null;
            var updateQuery = {
                location: {},
                contacts: {
                    phone: {}
                }
            };

            if (!!companyId) {
                updateQuery._id = companyId;
            }

            //inputs
            var name = $('#name').val(),
                description = $('#description').val(),
                vat = $('#vat').val(),
                visibility = tmpl.$('[name="visibility"]:checked').val(),
                registrationNumber = $("#registrationNumber").val(),
            //location
                country = $('#country').val(),
                city = $('#city').val(),
                address = $('#address').val(),
                zip = $('#zip').val(),
            //contacts
                number = $('#number').val(),
                email = $('#email').val(),
                website = $('#website').val(),
            //workers
                workersIds = _.map(tmpl.workers.array(), function (worker) {
                    return worker._id;
                });

            var formatPhoneNumberRegExp = /(\D)/g;
            number = number.replace(formatPhoneNumberRegExp, '');

            updateQuery.name = name;
            updateQuery.description = description;
            updateQuery.vat = vat;
            updateQuery.isPrivate = visibility == 'lib';
            updateQuery.registrationNumber = registrationNumber;
            updateQuery.location.country = country;
            updateQuery.location.city = city;
            updateQuery.location.address = address;
            updateQuery.location.zip = zip;
            updateQuery.contacts.phone.number = number;
            updateQuery.contacts.email = email;
            updateQuery.contacts.website = website;

            if (tmpl.logo) {
                updateQuery.logo = tmpl.logo;
            } else if (tmpl.data.company && tmpl.data.company.logoUrl) {
                if (tmpl.$('#delete-logo').prop('checked')) {
                    updateQuery.logoUrl = '';
                } else {
                    updateQuery.logoUrl = tmpl.data.company.logoUrl;
                }
            }

            updateQuery.workersIds = workersIds;
            return updateQuery;
        };

        var validateDocument = function (document) {
            if (!document.location.country) {
                VZ.notify('Select a country!');
                return false;
            } else {
                return true;
            }
        };

        event.preventDefault();

        // get document
        var document = getCompanyDocument();

        if (!validateDocument(document)) {
            return;
        }

        tmpl.$('#submit-form-button').attr('disabled', 'disabled');
        if (document._id) {
            Meteor.call('editCompany', document, function (err, res) {
                if (err) {
                    VZ.notify(err.reason);
                    tmpl.$('#submit-form-button').removeAttr('disabled');
                } else {
                    VZ.notify('Company updated');
                    Router.go('companyDetail', {id: document._id});
                }
            });
        } else {
            Meteor.call('addCompany', document, function (err, res) {
                if (err) {
                    VZ.notify(err.reason);
                    tmpl.$('#submit-form-button').removeAttr('disabled');
                } else {
                    VZ.notify('Company created');
                    Router.go('companyDetail', {id: res});
                }
            });
        }
    }, 1000, true),

    // for prevent displaying default error message in input
    'invalid input': function (event, tmpl) {
        event.preventDefault();
        var errorMessage = event.target.title;

        tmpl.requiredFieldsIsEmptyNotifyDebounced(errorMessage);
    },

    'blur input': function (event, tmpl) {
        //if ok - returns false, if not okay - returns error message
        var isInvalidInput = function (inputId, value) {
            if (!value) {
                return false;
            }
            switch (inputId) {
                case 'name':
                    if (/^[\wäöõåšžüÄÖÅÜÕŠŽ\s.,]{5,50}$/.test(value)) {
                        return false;
                    } else {
                        if (value.length < 5) {
                            return 'Name should be at least 5 characters!';
                        } else if (value.length > 50) {
                            return 'Name should be shorter that 50 characters!'
                        } else {
                            return 'Name should contain only alphabets or numbers!'
                        }
                    }
                    break;
                case 'vat':
                    var vatRegEx = '^((AT)?U[0-9]{8}|(BE)?0[0-9]{9}|(BG)?[0-9]{9,10}|(CY)?[0-9]{8}L|(CZ)?[0-9]{8,10}|(DE)?[0-9]{9}|(DK)?[0-9]{8}|(EE)?[0-9]{9}|(EL|GR)?[0-9]{9}|(ES)?[0-9A-Z][0-9]{7}[0-9A-Z]|(FI)?[0-9]{8}|(FR)?[0-9A-Z]{2}[0-9]{9}|(GB)?([0-9]{9}([0-9]{3})?|[A-Z]{2}[0-9]{3})|(HU)?[0-9]{8}|(IE)?[0-9]S[0-9]{5}L|(IT)?[0-9]{11}|(LT)?([0-9]{9}|[0-9]{12})|(LU)?[0-9]{8}|(LV)?[0-9]{11}|(MT)?[0-9]{8}|(NL)?[0-9]{9}B[0-9]{2}|(PL)?[0-9]{10}|(PT)?[0-9]{9}|(RO)?[0-9]{2,10}|(SE)?[0-9]{12}|(SI)?[0-9]{8}|(SK)?[0-9]{10})$';
                    if (new RegExp(vatRegEx).test(value)) {
                        return false;
                    } else {
                        return 'VAT number is not correct!';
                    }
                    break;
                case 'registrationNumber':
                    if (/^[a-zA-Z0-9]+$/.test(value)) {
                        return false;
                    } else {
                        return 'Registration number is not correct!';
                    }
                    break;
                case 'city':
                    if (/[\w\s.,-]+/.test(value)) {
                        return false;
                    } else {
                        return 'City is not correct!';
                    }
                    break;
                case 'address':
                    if (/[\w\s.,-]+/.test(value)) {
                        return false;
                    } else {
                        return 'Address is not correct!';
                    }
                    break;
                case 'zip':
                    if (/\d{5,10}/.test(value)) {
                        return false;
                    } else {
                        return 'Zip code is not correct!';
                    }
                    break;
                case 'number':
                    var phoneNumberRegEx = '^(?:(?:\\(?(?:00)([1-4]\\d\\d|[1-9]\\d?)\\)?)?[\\-\\.\\ \\\\\\/]?)?((?:\\(?\\d{1,}\\)?[\\-\\.\\ \\\\\\/]?){0,})(?:[\\-\\.\\ \\\\\\/]?(?:#|ext\\.?|extension|x)[\\-\\.\\ \\\\\\/]?(\\d+))?$';
                    if (new RegExp(phoneNumberRegEx).test(value)) {
                        return false;
                    } else {
                        return 'Phone number is not correct!';
                    }
                    break;
                case 'email':
                    if (/[\w\s.,-]+/.test(value)) {
                        return false;
                    } else {
                        return 'Email is not correct!';
                    }
                    break;
                case 'website':
                    var urlRegEx = '^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w\\.-]*)*\\/?$';
                    if (new RegExp(urlRegEx).test(value)) {
                        return false;
                    } else {
                        return 'URL is not correct!';
                    }
            }
        };

        var inputId = event.target.id;
        var inputValue = event.target.value;

        var $input = tmpl.$('#' + inputId);
        var $label = tmpl.$('[for="' + inputId + '"]');

        var errorMessage = isInvalidInput(inputId, inputValue);
        if (errorMessage) {
            $label.attr('data-error', errorMessage);
            setTimeout(function () {
                $input.addClass('invalid');
                tmpl.isAllInputsValid.set(false);
            }, 50);
        } else {
            $input.removeClass('invalid');

            var $invalidInputs = $('input.invalid');
            if ($invalidInputs.length == 0) {
                tmpl.isAllInputsValid.set(true);
            }
        }
    },

    // update request to google maps
    'blur .location-input': function (event, tmpl) {
        setTimeout(function () {
            var $city = tmpl.$('#city');
            var $address = tmpl.$('#address');
            var $zip = tmpl.$('#zip');

            if (!$city.hasClass('invalid') && !$address.hasClass('invalid')
                && !$zip.hasClass('invalid')) {
                var city = $city.val();
                tmpl.updateMapOptions('city', city);

                var address = $address.val();
                tmpl.updateMapOptions('address', address);

                var zip = $zip.val();
                tmpl.updateMapOptions('zip', zip);
            }
        }, 500);
    },

    // on select a country in list
    'change #country': function (event, tmpl) {
        tmpl.isCountrySelected.set(true);

        tmpl.$('#city').val('');
        tmpl.updateMapOptions('city', '');

        tmpl.$('#address').val('');
        tmpl.updateMapOptions('address', '');

        tmpl.$('#zip').val('');
        tmpl.updateMapOptions('zip', '');

        var value = event.target.value.trim();
        tmpl.updateMapOptions('country', value);
    },

    'change #logo': function (event, tmpl) {
        var checkFileType = function (file) {
            if (!file) {
                return false;
            }

            var typeRegEx = /^image\/(jpeg|JPEG|png|PNG|gif|GIF|tif|TIF)$/;
            if (!typeRegEx.test(file.type)) {
                VZ.notify('Wrong file type! Allowed jpeg, png, gif, tif');
                return false;
            }

            if (file.size >= 5 * 1000000) {
                VZ.notify('File too large! Limit 5MB');
                return false;
            }

            return true;
        };
        var saveLogo = function (file) {
            var reader = new FileReader();
            reader.onload = function () {
                var buffer = new Uint8Array(reader.result);
                tmpl.logo = {
                    buffer: buffer,
                    type: file.type
                };
            };
            reader.readAsArrayBuffer(file);
        };

        var file = event.target.files[0];
        if (checkFileType(file)) {
            saveLogo(file);
        } else {
            $(event.target).val('');
            delete tmpl.logo;
        }
    },

    // check is company name is unique in selected country
    'blur #name, change #country': function (event, tmpl) {
        var typedName = $('#name').val();
        var selectedCountry = $('#country').val();
        var projectId = tmpl.data.company ? tmpl.data.company._id : null;

        Meteor.call('checkWhetherCompanyNameIsUnique',
            typedName, selectedCountry, projectId, function (err, res) {
                if (err) {
                    VZ.notify(err.reason);
                } else if (res) {
                    tmpl.isCompanyNameUnique.set(true);
                } else if (!res) {
                    VZ.notify('Company with the same name is already exist!');
                    tmpl.isCompanyNameUnique.set(false);
                }
            });
    }
});