export const Jobs = new Mongo.Collection('vj-jobs');

Jobs.allow({
    insert: function (userId, doc) {
        return userId == 'wh8or4SeGKKr5WTDs';
    },
    update: function (userId, doc) {
        return userId == 'wh8or4SeGKKr5WTDs';
    }
});
export const JobsSchema = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },

    title: {
        type: String,
        min: 3,
        max: 50
    },
    contractType: {
        type: String
    },
    // categoryId: {
    //     type: String
    // },
    //
    // jobTypesIds: {
    //     type: Array,
    //     minCount: 1
    // },
    // 'jobTypesIds.$': {
    //     type: String
    // },
    //
    // location: {
    //     type: Object
    // },
    //
    // 'location.countryCode': {
    //     type: String,
    //     allowedValues: function () {
    //         return Countries.find().map(function (it) {
    //             return it.countryCode;
    //         });
    //     }
    // },
    // 'location.city': {
    //     type: String
    // },

    skillsIds: {
        type: Array,
        minCount: 1,
        maxCount: 7
    },
    'skillsIds.$': {
        type: String
    },

    // isAvailableAnywhere: {
    //     type: Boolean
    // },
    // employeeOriginCountry: {
    //     type: String,
    //     optional: true
    // },

    // isVisaSponsorshipEnabled: {
    //     type: Boolean
    // },

    // salary: {
    //     type: Object,
    //     optional: true
    // },
    salary: {
        type: Object
        // optional: true
    },
    'salary.type': {
        type: String,

    },
    'salary.hourlyRate': {
        type: Number,
        min: 3,
        decimal: true,
        optional: true
    },
    'salary.montlyRate': {
        type: Number,
        min: 3,
        decimal: true,
        optional: true
    },
    'salary.contractPrice': {
        type: Number,
        min: 3,
        decimal: true,
        optional: true
    },
    'salary.min': {
        type: Number,
        min: 0,
        optional: true
    },
    'salary.max': {
        type: Number,
        min: 1,
        optional: true
    },
    companyId: {
        type: String,
        optional: true
    },
    // 'salary.currency': {
    //     type: String
    // },

    // equity: {
    //     type: Object,
    //     optional: true
    // },
    // 'equity.min': {
    //     type: Number,
    //     min: 0
    // },
    // 'equity.max': {
    //     type: Number,
    //     min: 1
    // },
    equity: {
        type: Number,
        min: 0,
        max: 90,
        optional: true
    },

    // 'equity.yearVest': {
    //     type: Number
    // },
    //
    // 'equity.yearCliff': {
    //     type: Number
    // },

    description: {
        type: String,
        // min: 500
        min: 100,
        max: 5000
    },

    // companyName: {
    //     type: String,
    //     min: 3,
    //     max: 50
    // },
    //
    // headquaterLocation: {
    //     type: String,
    //     min: 5,
    //     max: 50
    // },
    //
    // website: {
    //     type: String,
    //     regEx: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    //     max: 50
    // },
    // contactInfo: {
    //     type: Object
    // },
    // 'contactInfo.name': {
    //     type: String,
    //     min: 3,
    //     max: 50
    // },
    // 'contactInfo.phone': {
    //     type: String
    //     //regEx: /^\+?\d{8,20}$/
    // },
    // 'contactInfo.email': {
    //     type: String,
    //     regEx: SimpleSchema.RegEx.Email,
    //     max: 50
    // },
    //
    // // adds in createJob method
    // isPublished: {
    //     type: Boolean,
    //     optional: true
    // },
    isDraft: {
        type: Boolean,
        optional: true
    },
    isArchived: {
        type: Boolean,
        optional: true
    },
    ownerId: {
        type: String,
        optional: true
    },
    // lastEditedBy: {
    //     type: String,
    //     optional: true
    // },
    createdAt: {
        type: Date,
        optional: true
    },
    expireAt: {
        type: Date,
        optional: true
    },
    viewerIds: {
        type: [String],
        min: 0,
        optional: true
    },
    applicantsIds: {
        type: Array,
        optional: true
    },
    'applicantsIds.$': {
        type: String
    },
    status: {
        type: String,
        min: 5,
        optional: true
    },
    workerLocation: {
        type: Object,
        optional: true
    },
    'workerLocation.isRestricted':{
        type: Boolean,
        optional: true
    },
    'workerLocation.continent':{
        type: String,
        optional: true
    },
    'workerLocation.country':{
        type: String,
        optional: true
    }
    // lastEditedAt: {
    //     type: Date,
    //     optional: true
    // }
});

JobsSchema.messages({

    // "minString title": "[label] must be at least [min] characters <id>title</id>",
    // "maxString title": "[label] cannot exceed [max] characters <id>title</id>",
    "minString title": "[label] must be at least [min] characters",
    "maxString title": "[label] cannot exceed [max] characters",
    "minString description": "[label] must be at least [min] characters",
    "maxString description": "[label] cannot exceed [max] characters",
    "required contractType": "Contract type is required",
    "required salary.type": "Salary type is required",
    "minCount skillsIds": "You must specify at least [minCount] skills",

    "expectedNumber equity": "[label] equity must be a number!",
    "required equity": "Equity required",

    // "required categoryId": "Select  job-category <id>category</id>",
    //
    // "minCount jobTypesIds": "You must specify at least [minCount] job type <id>job-type</id>",
    //
    // "required location.countryCode": "Select country <id>country-input</id>",
    // "notAllowed location.countryCode": "Select country <id>country-input</id>",
    //
    // "required location.city": "City is required <id>job-location-city</id>",
    //
    // "minString headquaterLocation": "[label] must be at least [min] characters <id>headquater-location</id>",
    // "maxString headquaterLocation": "[label] cannot exceed [max] characters <id>headquater-location</id>",

    // "minString description": "[label] must be at least [min] characters <id>description</id>",
    // "maxString description": "[label] cannot exceed [max] characters <id>description</id>",

    // "minString contactInfo.name": "[label] must be at least [min] characters <id>contact-name</id>",
    // "maxString contactInfo.name": "[label] cannot exceed [max] characters <id>contact-name</id>",

    // "expectedNumber salary.min": "[label] salary must be a number! <id>salary-min</id>",
    // "expectedNumber salary.max": "[label] salary must be a number! <id>salary-max</id>",

    // "expectedNumber equity.min": "[label] equity must be a number! <id>equity-range-min</id>",
    // "expectedNumber equity.max": "[label] equity must be a number! <id>equity-range-max</id>",
    //
    // "expectedNumber equity.yearVest": "[label] must be a number! <id>year-vest</id>",
    // "expectedNumber equity.yearCliff": "[label] must be a number! <id>year-cliff</id>",

    // "minString companyName": "[label] must be at least [min] characters <id>company-name</id>",
    // "maxString companyName": "[label] cannot exceed [max] characters <id>company-name</id>",

    // "required salary.min": "[label] salary is required! <id>salary-min</id>",
    // "required salary.max": "[label] salary is required! <id>salary-max</id>",

    // "required equity.min": "[label] equity is required! <id>equity-range-min</id>",
    // "required equity.max": "[label] equity is required! <id>equity-range-max</id>",
    //
    // "required equity.yearVest": "[label] is required! <id>year-vest</id>",
    // "required equity.yearCliff": "[label] is required! <id>year-clif</id>",

    // "regEx contactInfo.email": "Enter correct email <id>contact-email</id>",
    // "regEx website": "Enter correct websitе <id>website</id>"
    //"regEx contactInfo.phone": "Enter correct phone number <id>contact-phone</id>"
});

// export default JobsSchema;