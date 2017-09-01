import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { VZ } from '/imports/startup/both/namespace';

export const SocialMediaSchema = new SimpleSchema({
    socialMediaName: {
        type: String
    },
    socialMediaLink: {
        type: String,
        regEx: SimpleSchema.RegEx.Url
    }
});

export const Companies = new Mongo.Collection('vz-companies');
Companies.allow({
    insert: function (userId, doc) {
        return userId == 'wh8or4SeGKKr5WTDs';
    },
    update: function (userId, doc) {
        return userId == 'wh8or4SeGKKr5WTDs';
    }
});

VZ.UserRoles = VZ.UserRoles || {};
VZ.UserRoles.Company = {};

VZ.UserRoles.Company.userPositions = [{
    name: 'Manager',
    roles: ['company-worker', 'company-manager'],
    propertyNameInCollection: 'workersIds',
    canBeAssignedBy: ['company-admin']
}, {
    name: 'Worker',
    roles: ['company-worker'],
    propertyNameInCollection: 'workersIds',
    canBeAssignedBy: ['company-admin', 'company-manager']
}];

const Location = new SimpleSchema({
    country: {
        type: String
    },

    city: {
        type: String,
        optional: true
    },

    address: {
        type: String
    },

    zip: {
        type: String,
        optional: true
    }
});

const Phone = new SimpleSchema({
    countryCode: {
        type: String,
        optional: true
    },
    number: {
        type: String,
        optional: true
    }
});

const Contacts = new SimpleSchema({
    phones: {
        type: [String],
        optional: true
    },
    emails: {
        type: [String],
        optional: true
    },
    website: {
        type: String,
        optional: true
    }
});

const Company = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },

    name: {
        type: String,
        min: 2,
        max: 50
    },

    createdAt: {
        type: Date
    },

    ownerId: {
        type: String
    },

    isPrivate: {
        type: Boolean
    },
    isArchived: {
        type: Boolean,
        optional: true
    },

    description: {
        type: String,
        optional: true
    },

    logoUrl: {
        type: String,
        optional: true
    },

    location: {
        type: Location,
        optional: true
    },

    vat: {
        type: String,
        optional: true
    },

    registrationNumber: {
        type: String,
        optional: true
    },

    workersIds: {
        type: [String],
        optional: true
    },

    assignedTeamsIds: {
        type: [String],
        optional: true
    },

    admins: {
        type: String,
        optional: true
    },

    contacts: {
        type: Contacts,
        optional: true
    },

    status: {
        type: String,
        optional: true
    },

    archivedAt: {
        type: Date,
        optional: true
    },

    verified: {
        type: String,
        optional: true
    },
    modifiedAt: {
        type: Date,
        optional: true
    },
    modifiedBy: {
        type: String,
        optional: true
    },
    isArchivedFromBackOffice: {
        type: Boolean,
        optional: true
    },
    employeesCount: {
        type: String,
        optional: true
    },
    contactsRelated: {
        type: [String],
        optional: true
    },
    jobsRelated: {
        type: [String],
        optional: true
    },
    createdBy: {
        type: String,
        optional: true

    },
    year: {
        type: String,
        optional: true
    },
    socialMedia: {
        type: [SocialMediaSchema],
        optional: true
    }
});

if (!Meteor.settings.dontUseSchema) {
    Companies.attachSchema(Company);
}

