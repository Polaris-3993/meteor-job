import { VZ } from '/imports/startup/both/namespace';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Contracts } from '/imports/api/contracts/contracts';
import { Companies } from '/imports/api/companies/companies';
import './invoices-modal.html';

Template.invoicesModal.onCreated(function () {
    var self = this;
    var dateRangeObj = {
        date: moment().toDate(),
        range: 'Weekly'
    };
    this.dateRange = new ReactiveVar(dateRangeObj);
    this.userId = new ReactiveVar('');
    this.magic = new ReactiveVar(false);

    this.timeSummary = function (userId) {
        var oneHour = 1000 * 60 * 60;
        var rangeObj = self.dateRange.get();
        var start = moment(rangeObj.date).startOf(VZ.dateRanges[rangeObj.range]).toDate();
        var end = moment(rangeObj.date).endOf(VZ.dateRanges[rangeObj.range]).toDate();
        var totalSpent = 0;

        var totalMiliSeconds = 0;
        TimeEntries.find({
            userId: userId,
            _isActive: false,
            startDate: {
                $gte: start,
                $lte: end
            }
        }).forEach(function (entry) {
            var diff = moment(entry.endDate).diff(entry.startDate);
            var timeEntryDuration  = entry.endDate - entry.startDate;

            totalMiliSeconds += diff;
            var earned = timeEntryDuration * entry.paymentRate / oneHour;
            totalSpent += earned;
        });

        var hours = parseInt(moment.duration(totalMiliSeconds).asHours());
        hours = hours < 10 ? '0' + hours : hours;
        return {worked: hours + moment.utc(totalMiliSeconds).format(':mm'),
            earned: totalSpent}
    };
    this.autorun(function () {
        var dateRange = self.dateRange.get();
        var userId = self.userId.get();
        var workTimeSub = self.subscribe('userRangeWorkTime', dateRange, [userId]);
        var contractsSub = self.subscribe('ownerContracts');
        if(workTimeSub.ready() && contractsSub.ready()){
            self.magic.set(true);
        }
    });
});
Template.invoicesModal.onRendered(function () {
    var self = this;
    this.$('.modal').modal();
    this.$('.modal').modal('open');
    this.$('select').material_select();

    this.$('.lean-overlay').on('click', function () {
        removeTemplate(self.view);
    });
    document.addEventListener('keyup', function (e) {
        if (e.keyCode == 27) {
            removeTemplate(self.view);
        }
    });
    this.autorun(function () {
        self.magic.get();
        var contracts = Contracts.find({employerId: Meteor.userId()}).fetch();
        var workerIds = _.map(contracts, function (contract) {
            return contract.workerId;
        });
        workerIds = _.uniq(workerIds);
        var users = Meteor.users.find({_id: {$in: workerIds}}).fetch();
        if (users.length > 0) {
            setTimeout(function () {
                self.$('select').material_select();
            }, 300);
        }
    });
});
Template.invoicesModal.onDestroyed(function () {
    $('.lean-overlay').remove();
});

Template.invoicesModal.helpers({
    contractedUsers: function () {
        var contracts = Contracts.find({employerId: Meteor.userId()}).fetch();
        var workerIds = _.map(contracts, function (contract) {
            return contract.workerId;
        });
        workerIds = _.uniq(workerIds);
        var users = Meteor.users.find({_id: {$in: workerIds}}).fetch();
        return users;
    },
    pickerRange: function () {
        var dateRange = Template.instance().dateRange.get();
        var start = moment(dateRange.date).startOf(VZ.dateRanges[dateRange.range]).format('Do MMM YYYY');
        var end = moment(dateRange.date).endOf(VZ.dateRanges[dateRange.range]).format('Do MMM YYYY');

        return start + ' - ' + end;
    },
});

Template.invoicesModal.events({
    'change .dateRange-select': function (event, tmpl) {
        var range = tmpl.$(event.currentTarget).val();

        if (range) {
            var dateRange = tmpl.dateRange.get();
            dateRange.range = range;
            tmpl.dateRange.set(dateRange);
        }
    },

    'click .pick-prev-range': function (event, tmpl) {
        var dateRange = tmpl.dateRange.get();
        var range = VZ.dateRanges[dateRange.range];
        if (range === 'isoweek') {
            range = 'week'
        }
        dateRange.date = moment(dateRange.date).subtract(1, range).toDate();
        tmpl.dateRange.set(dateRange);
    },

    'click .pick-next-range': function (event, tmpl) {
        var dateRange = tmpl.dateRange.get();
        var range = VZ.dateRanges[dateRange.range];
        if (range === 'isoweek') {
            range = 'week'
        }
        dateRange.date = moment(dateRange.date).add(1, range).toDate();
        tmpl.dateRange.set(dateRange);
    },
    'change #users-select': function (event, tmpl) {
        event.preventDefault();
        var userId = tmpl.$('#users-select option:selected').val();
        tmpl.userId.set(userId);
    },
    'click .save': function (event, tmpl) {
        event.preventDefault();
        var dateRange = tmpl.dateRange.get();
        var userId = tmpl.userId.get();
        if(!userId){
            VZ.notify('Select user');
            return;
        }
        var start = moment(dateRange.date).startOf(VZ.dateRanges[dateRange.range]).toDate();
        var end = moment(dateRange.date).endOf(VZ.dateRanges[dateRange.range]).toDate();

        var query = {
            userId: userId,
            _isActive: false,
            startDate: {
                $gte: start,
                $lte: end
            }
        };
        var timeEntries =  TimeEntries.find(query).fetch();
        if(timeEntries.length == 0){
            VZ.notify('No entries found');
            return;
        }
        var timeSummary = tmpl.timeSummary(userId);
        var user = Meteor.users.findOne({_id: userId});
        var currentUser = Meteor.users.findOne({_id: Meteor.userId()});
        var currentUserName = currentUser && currentUser.profile && currentUser.profile.fullName;

        var contract = Contracts.findOne({workerId: userId, employerId: Meteor.userId(), status: 'active'});
        if(contract && !contract.companyId){
            VZ.notify('Contract '+contract.name + ' don\'t have company attached!');
            return;
        }
        var contractId = contract && contract._id;
        var company = Companies.findOne({_id: contractId});

        var noCompanyMessage = 'Contract don\'t have company id';
        var companyName = company && company.name || noCompanyMessage;
        var companyCity = company && company.city || noCompanyMessage;
        var companyCountry= company && company.country || noCompanyMessage;
        var companyZip = company && company.zip;
        var companyAddress= company && company.address;
        var totalAddress = companyAddress +', '+companyZip;
        var rate = contract && contract.paymentInfo && contract.paymentInfo.rate;
        rate = rate.toFixed(2);
        var userName = user && user.profile && user.profile.fullName;
        var formatedStart = moment(start).format('L');
        var formatedEnd = moment(end).format('L');
        var earned = timeSummary.earned.toFixed(2);
        var fileName = userName + ' ' + formatedStart + ' - ' + formatedEnd;
        fileName = fileName.toString();
        var content = '('+userId+') '+userName + ' - ' + timeSummary.worked + ' hrs @ $'+rate+'/hr' + ' - ' + formatedStart+ ' - ' +formatedEnd;
        content = content.toString();

        var docDefinition = {
            content: [
                {
                    columns: [
                        {
                            width: '*',
                            text: [{text:'From:\n', bold:true},{ text: ' '+userName, color:'#333', fontSize:10},
                                {text:'\n\nBill to:\n', bold:true},
                                {text:' '+companyName+'\nAttn: '+currentUserName+' \n'+companyCity+' \n'+totalAddress+'+\n'+companyCountry+' ', color:'#333', fontSize:10}]
                        },
                        {
                            width: '*',
                            text: ''
                        },
                        {
                            width: '*',
                            text: [
                                {text:'I N V O I C E \n\n', alignment: 'right', fontSize:30, color:'#333'},
                                {text:'INVOICE : V12345 \n', alignment: 'right', color:'#333', fontSize:10},
                                {text:'DATE : '+moment().format('MMMM D YYYY')+'\n', alignment: 'right', color:'#333', fontSize:10},
                                {text:'TOTAL AMOUNT : $'+earned+'\n', alignment: 'right', color:'#333', fontSize:10},
                                {text:'TOTAL DUE : $'+earned, alignment: 'right', bold:true, color:'#333', fontSize:10},
                            ]
                        },
                    ],

                    // optional space between columns
                    columnGap: 10
                },
                {
                },

                {
                    text:'\n\n\n',
                },

                {
                    table: {
                        // headers are automatically repeated if the table spans over multiple pages
                        // you can declare how many rows should be treated as headers
                        headerRows: 1,
                        widths: [ '*', 'auto' ],

                        body: [
                            [ 'DESCRIPTION/MEMO', 'AMOUNT'],
                            [ {text: content, fontSize:10}, {text: earned, fontSize:10}],
                            [ { text: 'TOTAL AMOUNT', bold: true }, '$'+earned]
                        ]
                    }
                },

                {
                    text: [ { text: '\n Invoice created via Vez.io', alignment:'right' }]
                },

            ]};
        pdfMake.createPdf(docDefinition).download(fileName);
    },
    'click .cancel': function (event, tmpl) {
        event.preventDefault();
        tmpl.$('#edit-profile-modal').modal('close');
        removeTemplate(tmpl.view);
    }
});

var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};