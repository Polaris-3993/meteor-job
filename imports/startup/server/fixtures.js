import { SyncedCron } from 'meteor/percolate:synced-cron';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import { Countries } from '/imports/api/countries/countries';
import { Skills } from '/imports/api/skills/skills';
import { Industries } from '/imports/api/industries/industries';
import { Positions } from '/imports/api/positions/positions';
import { Transactions } from '/imports/api/transactions/transactions';
import { BankCredentials } from '/imports/api/bankCredentials/bankCredentials';
import { Jobs } from '/imports/api/jobs/jobs';

WebApp.connectHandlers.use("/packages/materialize_materialize/fonts", function (req, res) {
    const url = req.originalUrl.replace("/fonts/", "/dist/fonts/");
    res.statusCode = 301;
    res.setHeader("Location", url);
    res.end();
});

Meteor.startup(function () {
    SyncedCron.start();
    // var tasks = Tasks.find().fetch();
    // _.each(tasks, function (task) {
    //     if(task.taskFiles){
    //         var taskFilesToUpload = [];
    //         var taskFiles = task.taskFiles;
    //         _.each(taskFiles, function (file) {
    //            if(file.size && typeof file.size == 'string'){
    //                file.size =  4000000;
    //                taskFilesToUpload.push(file);
    //            }
    //            else if(!file.size && !file.uploaded){
    //                file.size =  4000000;
    //                file.uploaded =  new Date();
    //                taskFilesToUpload.push(file);
    //            }
    //         });
    //         Tasks.update({_id: task._id},{$set: {taskFiles: taskFilesToUpload}});
    //     }
    // });

    fillCountries();
    fillSkills();
    fillIndustries();
    fillPositions();
    // addBankCredentials();
});
//TODO: may be used in the future

// var fixAndriiEntries = function () {
//     var timeEntries = TimeEntries.find({userId: 'sXAKqpG5yiWRbzzCL', _isActive: false}).fetch();
//     var withoutContract = _.filter(timeEntries, function (entry) {
//         return !entry.contractId;
//     });
//     var withoutContractIds = _.map(withoutContract, function (entry) {
//         return entry._id;
//     });
//     TimeEntries.update({_id: {$in: withoutContractIds}}, {$set: {contractId: 'jibYDXXa3nup6fN7c', paymentType: 'hourly', paymentRate: 5}}, {multi: true});
// };
var fillCountries = function () {
    var countriesList = JSON.parse(Assets.getText('countries.json'));
    var countriesCodes = _.keys(countriesList.countries);
    var countries = Countries.find().fetch();
    if (countries.length > 0 && !countries[0].continentCode && !countries[1].continentCode && !countries[2].continentCode) {
        _.each(countries, function (element) {
            _.each(countriesCodes, function (element1) {
                if (element.countryCode == element1) {
                    var country = countriesList.countries[element1];
                    Countries.update({_id: element._id}, {$set: {continentCode: country.continent}})
                }
            });
        });
        console.log('Countries updated with continent code');
    }
};

var fillSkills = function () {
    // Skills.remove({});
    if(Skills.find().count() <= 0){
        var skillsList = JSON.parse(Assets.getText('skills.json'));
        for (var i = 0; i < skillsList.length; i++){
            // console.log(skillsList[i]);
            Skills.insert(skillsList[i]);
        }
        console.log('Skills inserted');
    }
};

var fillIndustries = function () {
    if(Industries.find().count() <= 0){
        var industriesList = JSON.parse(Assets.getText('industries.json'));
        for (var i = 0; i < industriesList.length; i++){
            Industries.insert(industriesList[i]);
        }
        console.log('Industries inserted');
    }
};

var fillPositions = function () {
    if(Positions.find().count() <= 0){
        var positionsList = JSON.parse(Assets.getText('positions.json'));
        for (var i = 0; i < positionsList.length; i++){
            Positions.insert(positionsList[i]);
        }
        console.log('Positions inserted');
    }
};

var addBankCredentials = function () {
    var allUsers = Meteor.users.find().fetch();
    for(var i = 0; i < allUsers.length; i++){
        if(allUsers[i].profile  && allUsers[i].profile.fullName){
            BankCredentials.insert({
                name: allUsers[i].profile && allUsers[i].profile.fullName,
                recipientEmail: allUsers[i].emails && allUsers[i].emails[0] && allUsers[i].emails[0].address,
                receiverType: 'personal',
                targetCurrency: 'USD',
                addressFirstLine: '1 City Road',
                addressPostCode: 'N1 1ZZ/90210',
                addressCity: 'London',
                addressState: 'Tex',
                addressCountryCode: 'gbr',
                abartn: '111000025',
                accountNumber: '12345678',
                accountType: 'checking',
                userId: allUsers[i]._id,
                createdAt: new Date(),
                updatedAt: new Date
            });
        }
    }
};