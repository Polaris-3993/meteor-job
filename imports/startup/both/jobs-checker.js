import { JobsSchema } from '/imports/api/jobs/jobs';

var makeNumverifyRequest = _.debounce(function (jobDocument) {
    if (Meteor.isServer) {
        var baseUrl = 'http://apilayer.net/api/validate?access_key=';
        var accessKey = Meteor.settings.private.NumverifyAccessKey;
        var number = "&number=" + jobDocument.contactInfo.phone;
        var url = baseUrl + accessKey + number;

        var resultJSON = HTTP.get(url, {});

        var result = JSON.parse(resultJSON.content);
        if (!result.valid) {
            throw new Meteor.Error('Validation error', 'Incorrect phone number! <id>contact-phone</id>');
        }
    }
}, 500, true);

JobsChecker = Match.Where(function (jobDocument) {
    check(jobDocument, JobsSchema);

    if (jobDocument.salary && jobDocument.salary.min >= jobDocument.salary.max) {
        throw new Meteor.Error('Validation error', 'Min salary should be less than max value! <id>salary-min</id>');
    }
    // else if (jobDocument.equity && jobDocument.equity.min >= jobDocument.equity.max) {
    //     throw new Meteor.Error('Validation error', 'Equity min should be less than max value! <id>equity-range-min</id>');
    // }
    // else if (!jobDocument.isAvailableAnywhere && !jobDocument.employeeOriginCountry) {
    //     throw new Meteor.Error('Validation error', 'Employee origin country is required! <id>employee-origin-country</id>');
    // }
    else if (jobDocument.salary.type && !jobDocument.salary.min && !jobDocument.salary.max && !jobDocument.salary.hourlyRate && !jobDocument.salary.montlyRate && !jobDocument.salary.contractPrice) {
        throw new Meteor.Error('Validation error', 'Salary amount required');
    }
    // makeNumverifyRequest(jobDocument);

    return true;
});
