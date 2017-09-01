import { VZ } from '/imports/startup/both/namespace';

VZ.UserRoles = {};

var Users = {
    Collections: {},
    Schemas: {}
};

_.extend(GS, {
    Users: Users
});

Schemas = Schemas || {};

Schemas.profilePhoto = new SimpleSchema({
    large: {
        type: String,
        defaultValue: '/images/default-lockout.png'
    },
    small: {
        type: String,
        defaultValue: '/images/default-lockout.png'
    }
});

Schemas.UserProfile = new SimpleSchema({
    availability: {
        type: Boolean,
        optional: true
    },
    photo: {
        type: Schemas.profilePhoto,
        optional: true
    },

    firstName: {
        type: String,
        optional: true
    },

    lastName: {
        type: String,
        optional: true
    },

    fullName: {
        type: String,
        optional: true
    },

    description: {
        type: String,
        optional: true
    },

    gender: {
        type: String,
        allowedValues: ['', 'male', 'female'],
        optional: true
    },

    location: {
        type: Object,
        optional: true
    },

    skills: {
        type: [String],
        optional: true
    },

    education: {
        type: String,
        optional: true
    },

    projectsDone: {
        type: Number,
        min: 0,
        optional: true
    },

    activeProjects: {
        type: Number,
        min: 0,
        optional: true
    },

    teamName: {
        type: String,
        optional: true
    },
    lastWorkedEntryId: {
        type: String,
        optional: true
    },
    isArchived: {
        type: Boolean,
        optional: true
    },
    isBlocked: {
        type: Boolean,
        optional: true
    },
    blockedBy: {
        type: String,
        optional: true
    },
    blockedAt: {
        type: Date,
        optional: true
    },
    blockedWhy: {
        type: String,
        optional: true
    },
    archivedBy: {
        type: String,
        optional: true
    },
    archivedAt: {
        type: Date,
        optional: true
    }
});


Schemas.User = new SimpleSchema({

    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },

    emails: {
        type: [Object],
        optional: false
    },

    'emails.$.address': {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },

    'emails.$.verified': {
        type: Boolean
    },

    createdAt: {
        type: Date
    },

    profile: {
        type: Schemas.UserProfile,
        optional: true
    },

    services: {
        type: Object,
        optional: true,
        blackbox: true
    },

    status: {
        type: String,
        optional: true
    },

    roles: {
        type: [String],
        optional: true
    }
});