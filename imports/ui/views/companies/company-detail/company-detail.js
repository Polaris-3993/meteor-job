import { VZ } from '/imports/startup/both/namespace';
import './company-jobs/company-jobs';
import './company-profile/company-profile';
import './company-teams/company-teams';
import './company-workers/company-workers';
import './company-workplaces/company-workplaces';
import './info-cards/infocards';
import './company-detail.html';

import { Workplaces } from '/imports/api/workPlaces/workPlaces';

Template.companyDetail.onCreated(function () {
    this.loadingLogo = new ReactiveVar(false);
    this.currentTab = new ReactiveVar('companyProfile');
});

Template.companyDetail.onRendered(function () {
    $('.modal-trigger').modal();
    this.$('ul.tabs').tabs();
});

Template.companyDetail.helpers({
    tab: function () {
        return Template.instance().currentTab.get();
    },
    loadingLogo: function () {
        return Template.instance().loadingLogo.get();
    },
    
    canEditCompany: function () {
        return VZ.canUser('editCompany', Meteor.userId(), this.company._id);
    },
    
    canAndNeedToVerify: function () {
        var canUserVerifyCompany = VZ.canUser('verifyCompany', Meteor.userId());
        return canUserVerifyCompany && this.verified == 'verified';
    },
    
    companyLogo: function () {
        return this.company.logoUrl ? this.company.logoUrl : "/images/company-default.png"
    },
    
    companyName: function () {
        return this.company.name;
    },
    
    companyInfo: function () {
        return {
            registrationNumber: this.company.registrationNumber,
            vat: this.company.vat
        }
    },
    
    companyAddress: function () {
        return this.company.location
    },
    
    companyContacts: function () {
        return this.company.contacts;
    },
    
    companyDescription: function () {
        return this.company.description
    },
    
    isHaveWorkplaces: function () {
        return Workplaces.find().count() > 0;
    }
});

Template.companyDetail.events({
    'click .tabs-row li': function (e, tmp) {
        var currentTab = $(e.target).closest('li');
        tmp.currentTab.set(currentTab.data('template'));
    },
    'click .company-logo': function (e, tmpl) {
       e.preventDefault();
       tmpl.$(".company-logo-input").click();
    },
    
    'change .company-logo-input': function (e, tmpl) {
        var file = $(event.target).prop('files')[0];

        if (!photoValidation(file)) {
            return
        }
        
        tmpl.loadingLogo.set(true);
        var reader = new FileReader();
        reader.onload = function (event) {
            var buffer = new Uint8Array(reader.result);

            Meteor.call('updateCompanyLogo', buffer, file.type, tmpl.data.company._id, function (err, res) {

                if (err) {
                    VZ.notify('Failed to upload company logo');
                    tmpl.loadingLogo.set(false);
                }
                else {
                    VZ.notify('Company logo uploaded!');
                    tmpl.loadingLogo.set(false);
                }

            })

        };
        reader.readAsArrayBuffer(file);
    },
    
    'click .verify-company': function (e, tmpl) {
        var companyId = tmpl.data.company._id;
        Meteor.call('verifyCompany', companyId, function (err) {
            if (err) {
                console.log(err);
                VZ.notify('Failed to verify company');
            } else {
                VZ.notify('Company verified');
                Router.go('companyVerifying');
            }
        })
    }
});

var photoValidation = function (file) {
    if (!file) {
        return
    }
    if (file.size >= 5 * 1000000) {
        VZ.notify('File too large! Limit 5MB');
        $('.company-logo-input').val('');
        return
    }
    var typeRegEx = /^image\/(jpeg|JPEG|png|PNG|gif|GIF|tif|TIF)$/
    if (!typeRegEx.test(file.type)) {
        VZ.notify('Wrong file type! Allowed jpeg, png, gif, tif');
        $('.company-logo-input').val('');
        return
    }

    return true
};