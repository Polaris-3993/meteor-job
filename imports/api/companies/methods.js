import { Companies } from './companies';
import { VZ } from '/imports/startup/both/namespace';
import { ValidatedMethod } from 'meteor/mdg:validated-method';


export const addCompany = new ValidatedMethod({
    name: 'Companies.addCompany',
    validate: new SimpleSchema({
        name: {type: String},
        createdAt: {type: Date},
        ownerId: {type: String},
    }).validator(),
    run({document}) {
        const userId = this.userId;
        if (!userId) {
            throw new Meteor.Error('Companies.addCompany.notLoggedIn','You should be logged in!');
        }
        if (!document.isPrivate && !Meteor.call('checkWhetherCompanyNameIsUnique',
                document.name, document.location.country)) {
            throw new Meteor.Error('Company with the same name already exist!');
        }
        document.isArchived = false;
        document._id = Random.id();
        document.ownerId = userId;
        document.createdAt = new Date();
        document = uploadCompanyLogoToGoogleStorage(document);

        var companyId = Companies.insert(document);

        // owner is company admin
        Roles.addUsersToRoles(userId, 'company-admin', companyId);

        var user = Meteor.users.findOne({_id: userId});
        var notificationMsg = "Company - "+document.name+" - added by " + user.profile.fullName;
        Meteor.call("sendNotifications", "Added new company", notificationMsg, userId);

        return companyId;
    }
});

export const editCompany = new ValidatedMethod({
    name: 'Companies.editCompany',
    validate: new SimpleSchema({
        name: {type: String},
        createdAt: {type: Date},
        ownerId: {type: String},
    }).validator(),
    run({document}) {
        const userId = this.userId;
        const companyToUpdate = Companies.findOne({_id: document._id});
        if (!companyToUpdate) {
            throw new Meteor.Error('Company is not exist!');
        }
        if (!VZ.canUser('editCompany', userId, companyToUpdate._id)) {
            throw new Meteor.Error('You\'re not allowed to edit this company!');
        }

        if (!document.isPrivate && !Meteor.call('checkWhetherCompanyNameIsUnique',
                document.name, document.location.country, document._id)) {
            throw new Meteor.Error('Company with the same name already exist!');
        }

        document = uploadCompanyLogoToGoogleStorage(document);

        Companies.update({_id: companyToUpdate._id}, {$set: document}, function (err) {
            if (err) {
                console.log(err);
                throw new Meteor.Error('Company editing failed');
            }
        });
    },
});

export const archiveCompany = new ValidatedMethod({
    name: 'archiveCompany',
    validate: new SimpleSchema({
        id: {type: String}
    }).validator(),
    run({id}) {
        const userId = this.userId;
        const companyToArchive = Companies.findOne(id);
        if (!companyToArchive) {
            throw new Meteor.Error('Company is not exist!');
        }
        if (!VZ.canUser('archiveCompany', userId, companyToArchive._id)) {
            throw new Meteor.Error('You\'re not allowed to archive this company!');
        }
        let query = {
            isArchived: true,
            archivedAt: new Date()
        };
        Companies.update({_id: id, ownerId: userId}, {$set: query}, function (err) {
            if (err) {
                console.log(err);
                throw new Meteor.Error('Company deleting failed ! You must be an owner');
            }
        });
        const ownerId = companyToArchive.ownerId;
        const user = Meteor.users.findOne({_id: ownerId});
        let notificationMsg = "Company - " + companyToArchive.name + " - archived by " + user.profile.fullName;
        Meteor.call("sendNotifications", "Archived company", notificationMsg, userId);
    },
});

export const archiveCompanies = new ValidatedMethod({
    name: 'archiveCompanies',
    validate: new SimpleSchema({
        taskIds: {type: [String]}
    }).validator(),
    run({taskIds}) {
        for (let i=0; i < taskIds.length; i++) {
            Companies.update({_id: taskIds[i]}, {
                $set: {
                    isArchived: true
                }
            });
        }
    }
});

export const restoreCompanies = new ValidatedMethod({
    name: 'restoreCompanies',
    validate: new SimpleSchema({
        companyIds: {type: [String]}
    }).validator(),
    run({companyIds}) {
        for (let i=0; i < companyIds.length; i++){
            Companies.update({_id: companyIds[i]}, {
                $set: {
                    isArchived: false

                }
            });
        }
    }
});

export const restoreCompany = new ValidatedMethod({
    name: 'restoreCompany',
    validate: new SimpleSchema({
        companyId: {type: String}
    }).validator(),
    run({companyId}) {
        const userId = this.userId;
        if (VZ.canUser('restoreCompany', userId, companyId)) {
            const company = Companies.findOne({_id: companyId});
            Companies.update(companyId, {
                $set: {
                    isArchived: false
                }
            });
            const user = Meteor.users.findOne({_id: this.userId});
            let notificationMsg = "Company - " + company.name + " - restored by " + user.profile.fullName + " -";
            Meteor.call("sendNotifications", "Company restored", notificationMsg, this.userId);
        } else {
            throw new Meteor.Error('permission-error', 'You can\'t restore this company!');
        }
    }
});

export const verifyCompany = new ValidatedMethod({
    name: 'verifyCompany',
    validate: new SimpleSchema({
        id: {type: [String]}
    }).validator(),
    run({id}) {
        const userId = this.userId;
        if (userId && VZ.canUser('verifyCompany', userId)) {
            Companies.update({_id: id}, {$set: {verified: 'verified'}});
        }
    }
});

export const updateCompanyLogo = new ValidatedMethod({
    name: 'updateCompanyLogo',
    validate: new SimpleSchema({
        buffer: { type: Uint8Array },
        type: { type: String},
        companyId: { type: String}
    }).validator(),
    run({buffer, type, companyId}) {
        if (companyId) {
            var params = {
                name: companyId,
                type: type,
                buffer: buffer,
                bucketName: 'vezio_companies_logo'
            };
            try {
                var mediaLink = Meteor.call('uploadPhoto', params);
                console.log(mediaLink);
                Companies.update({_id: companyId}, {$set: {'logoUrl': mediaLink}});
            } catch (e) {
                return e;
            }
        }
    }
});

export const checkWhetherCompanyNameIsUnique = new ValidatedMethod({
    name: 'checkWhetherCompanyNameIsUnique',
    validate: new SimpleSchema({
        name: {type: String},
        country: {type: String},
        id: {type: String}
    }).validator(),
    run({name, country, id}) {
        const query = {name: name, 'location.country': country, _id: {$ne: id}};
        return !Companies.findOne(query);
    }
});

Meteor.methods({

    assignUsersToCompany: function (companyId, assignedUsersWithPositions,
                                    assignedUsersWithPositionsBeforeChanges) {

        var userId = this.userId;
        var companyToUpdate = Companies.findOne(companyId);

        if (!companyToUpdate) {
            throw new Meteor.Error('Company is not exist!');
        }

        if (!VZ.canUser('assignUserToCompany', userId, companyToUpdate._id)) {
            throw new Meteor.Error('You\'re not allowed to assign users to this company!');
        }

        var availablePositions = VZ.UserRoles.Company.userPositions;

        // check whether all changed positions can be updated by current user
        // and update roles after that
        VZ.Server.UserRoles.changeUserRoles(companyId,
            assignedUsersWithPositionsBeforeChanges, assignedUsersWithPositions, availablePositions);

        // If user roles was updated - update company workers list
        var assignedUsersMap = VZ.Server.UserRoles
            .fillAssignedUsersMap(assignedUsersWithPositions, availablePositions);
        Companies.update({_id: companyId}, {$set: assignedUsersMap});
    }
});


var uploadCompanyLogoToGoogleStorage = function (document) {
    if (document.logo) {
        var logoParams = {
            name: document._id,
            buffer: document.logo.buffer,
            type: document.logo.type,
            bucketName: 'vezio_companies_logo'
        };
        var mediaLink = Meteor.call('uploadPhoto', logoParams);

        document = _.omit(document, 'logo');
        document.logoUrl = mediaLink;
    }
    return document;
};