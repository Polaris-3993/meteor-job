export const UserWorkExperience = new Mongo.Collection('vz-user-work-experience');
const WorkExperienceSchema = new SimpleSchema({
    title: {
        type: String,
        min: 3,
        max: 70
    },
    company: {
        type: String,
        min: 3,
        max: 70
    },
    description: {
        type: String,
        min: 3,
        max: 300
    },
    isWorking: {
        type: Boolean
    },
    startAt: {
        type: Date
    },
    completeAt: {
        type: Date,
        optional: true
    }
});

WorkExperienceSchema.messages({

    "minString title": "[label] must be at least [min] characters",
    "maxString title": "[label] cannot exceed [max] characters",

    "required title": "Job title is required",

    "minString company": "[label] must be at least [min] characters",
    "maxString company": "[label] cannot exceed [max] characters",

    "required company": "Company is required",

    "minString description": "[label] must be at least [min] characters",
    "maxString description": "[label] cannot exceed [max] characters",

    "required description": "Decription is required",

    "required startAt": "Date creation required",
    "required completeAt": "Date complete required"
});

if (!Meteor.settings.dontUseSchema) {
    UserWorkExperience.attachSchema(WorkExperienceSchema);
}
