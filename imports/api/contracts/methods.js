import { Projects } from '/imports/api/projects/projects';
import { Contracts } from './contracts';
import { ContractsStatusChanges } from '/imports/api/contractsStatusChanges/contractsStatusChanges';
import { VZ } from '/imports/startup/both/namespace';

Meteor.methods({
    createContract: function (contract) {
        if (!this.userId) {
            throw new Meteor.Error('permission-error', 'You should be logged in to create contract!');
        }

        return ContractsMethods.createContract(contract, this.userId);
    },

    editContract: function (contract) {
        if (!this.userId) {
            throw new Meteor.Error('permission-error', 'You should be logged in to create contract!');
        }

        return ContractsMethods.editContract(contract, this.userId);
    },

    acceptContract: function (contractId) {
        if (!VZ.canUser('acceptContract', this.userId, contractId)) {
            throw new Meteor.Error('permission-error', 'You don\'t have permission to accept this contract!')
        }

        return ContractsMethods.acceptContract(contractId, this.userId);
    },

    declineContract: function (contractId) {
        if (!VZ.canUser('declineContract', this.userId, contractId)) {
            throw new Meteor.Error('permission-error', 'You don\'t have permission to decline this contract!')
        }

        return ContractsMethods.declineContract(contractId, this.userId);
    },

    pauseContract: function (contractId) {
        if (!VZ.canUser('pauseContract', this.userId, contractId)) {
            throw new Meteor.Error('permission-error', 'You don\'t have permission to pause this contract!')
        }

        return ContractsMethods.pauseContract(contractId, this.userId);
    },

    endContract: function (contractId) {
        if (!VZ.canUser('endContract', this.userId, contractId)) {
            throw new Meteor.Error('permission-error', 'You don\'t have permission to end this contract!')
        }

        return ContractsMethods.endContract(contractId, this.userId);
    },

    continueContract: function (contractId) {
        if (!VZ.canUser('endContract', this.userId, contractId)) {
            throw new Meteor.Error('permission-error', 'You don\'t have permission to end this contract!')
        }

        return ContractsMethods.continueContract(contractId, this.userId);
    },
    deleteContract: function (contractId) {
        console.log(contractId);
        if (!VZ.canUser('deleteContract', this.userId, contractId)) {
            throw new Meteor.Error('permission-error', 'You don\'t have permission to delete contract!')
        }

        return ContractsMethods.deleteContract(contractId, this.userId);
    },
    deleteContracts: function (contractIds) {
        var userId = this.userId;
        for (var i = 0; i < contractIds.length; i++){
            var contract = Contracts.findOne({_id: contractIds[i]});
            if (!VZ.canUser('deleteContract', userId, contractIds[i])) {
                throw new Meteor.Error('permission-error', 'You don\'t have permission to delete '+contract.name+' contract!')
            }
        }
        return ContractsMethods.deleteContracts(contractIds, this.userId);
    }
});

const ContractsMethods = {
    createContract: function (contract, userId) {
        check(contract, Object);
        contract.employerId = userId;
        var userRole =  contract.userRole;
        contract = _.omit(contract, 'userRole');
        var worker = Meteor.users.findOne(contract.workerId);
        if (!worker) {
            throw new Meteor.Error('invalid-data-error', 'Can not find a worker with given workerId!');
        } else if (worker._id == contract.employerId) {
            throw new Meteor.Error('invalid-data-error', 'workerId and employerId should be different!');
        }

        if (contract.companyId && !VZ.canUser('contractingAsCompanyWithWorker', contract.employerId, contract.companyId)) {
            throw new Meteor.Error('permission-error', 'You don\'n have permissions to contracting worker to this company!');
        }
        // if (contract.projectIds && contract.projectIds[0] && !VZ.canUser('assignUserToProject', contract.employerId, contract.projectIds[0])) {
        //     throw new Meteor.Error('permission-error', 'You don\'n have permissions to assigning users to this project!');
        // }

        contract.createdAt = new Date();
        contract.status = "pending";

        var contractId = Contracts.insert(contract);
        this._changeContractStatus(contractId, 'pending', contract.employerId);

        // TODO: assign user to project, if projectId exists

        Roles.addUsersToRoles(userId, 'contract-employer', contractId);
        Roles.addUsersToRoles(worker._id, 'contract-worker', contractId);

        for (var i = 0; i < contract.projectIds.length; i++){
            var isInProject = Roles.userIsInRole(worker._id, ['project-worker, project-viewer'], contract.projectIds[i]);
            if(isInProject){
                var project = Projects.findOne({_id: contract.projectIds[i]});
                var projectName = project && project.name;
                throw new Meteor.Error('invalid-data-error', 'User is already a assigned to '+projectName);
            }
            // Roles.addUsersToRoles(worker._id, userRole, contractId);
            Roles.addUsersToRoles(worker._id, userRole, contract.projectIds[i]);
        }
        if(userRole == 'project-worker'){
            Projects.update({_id: {$in: contract.projectIds}},{$addToSet: {assignedUsersIds: worker._id}}, {multi: true});
        }
        return contractId;
    },
    editContract: function (contract, userId) {
        check(contract, Object);
        var contractId = contract._id;
        var currentContract = Contracts.findOne({_id: contractId});
        var contractProjectIds = currentContract.projectIds;
        contract.employerId = userId;
        var userRole =  contract.userRole;
        contract = _.omit(contract, 'userRole');
        var worker = Meteor.users.findOne({_id: contract.workerId});
        if (!worker) {
            throw new Meteor.Error('invalid-data-error', 'Can not find a worker with given workerId!');
        } else if (worker._id == contract.employerId) {
            throw new Meteor.Error('invalid-data-error', 'workerId and employerId should be different!');
        }

        if (contract.companyId && !VZ.canUser('contractingAsCompanyWithWorker', contract.employerId, contract.companyId)) {
            throw new Meteor.Error('permission-error', 'You don\'n have permissions to contracting worker to this company!');
        }

        Projects.update({_id: {$in: contractProjectIds}},{$pull: {assignedUsersIds: worker._id}}, {multi: true});
        for (var j = 0; j < contractProjectIds.length; j++) {
            Roles.removeUsersFromRoles(worker._id, 'project-worker', contractProjectIds[j]);
            Roles.removeUsersFromRoles(worker._id, 'project-viewer', contractProjectIds[j]);
        }

        Contracts.update({_id: contractId}, {$set: contract});

        // TODO: assign user to project, if projectId exists

        for (var i = 0; i < contract.projectIds.length; i++){
            var isInProject = Roles.userIsInRole(worker._id, ['project-worker, project-viewer'], contract.projectIds[i]);
            if(isInProject){
                var project = Projects.findOne({_id: contract.projectIds[i]});
                var projectName = project && project.name;
                throw new Meteor.Error('invalid-data-error', 'User is already a assigned to '+projectName);
            }
            Roles.addUsersToRoles(worker._id, userRole, contract.projectIds[i]);
        }
        if(userRole == 'project-worker'){
            Projects.update({_id: {$in: contract.projectIds}},{$addToSet: {assignedUsersIds: worker._id}}, {multi: true});
        }
        return contractId;
    },
    acceptContract: function (contractId, userId) {
        ContractsMethods._changeContractStatus(contractId, 'active', userId);
    },
    declineContract: function (contractId, userId) {
        ContractsMethods._changeContractStatus(contractId, 'declined', userId);
    },
    pauseContract: function (contractId, userId) {
        ContractsMethods._changeContractStatus(contractId, 'paused', userId);
    },
    endContract: function (contractId, userId) {
        ContractsMethods._changeContractStatus(contractId, 'ended', userId);
    },
    continueContract: function (contractId, userId) {
        ContractsMethods._changeContractStatus(contractId, 'active', userId);
    },
    deleteContract: function (contractId, userId) {
        var contract = Contracts.findOne(contractId);
        var workerId = contract.workerId;
        Contracts.remove({_id: contractId});
        Roles.removeUsersFromRoles(userId, 'contract-employer', contractId);
        Roles.removeUsersFromRoles(workerId, 'contract-worker', contractId);

    },
    deleteContracts: function (contractIds, userId) {
        for (var i = 0; i < contractIds.length; i++){
            var contract = Contracts.findOne({_id: contractIds[i]});
            var workerId = contract.workerId;
            Contracts.remove({_id: contract._id});
            Roles.removeUsersFromRoles(userId, 'contract-employer', contract._id);
            Roles.removeUsersFromRoles(workerId, 'contract-worker', contract._id);
        }
    },
    _changeContractStatus: function (contractId, status, userId) {
        var contract = Contracts.findOne(contractId);

        if (!contract) {
            throw new Meteor.Error('invalid-data', 'Can not find a contract with given id!');
        }

        Contracts.update(contractId, {$set: {status: status}});

        return ContractsStatusChanges.insert({
            contractId: contractId,
            status: status,
            changedAt: new Date(),
            changedByUserId: userId
        });
    }
};