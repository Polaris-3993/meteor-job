import { Jobs } from '/imports/api/jobs/jobs';

Router.map(function () {
    // User jobs
    this.route('userJobs', {
        path: '/jobs/my',
        layoutTemplate: 'mainLayout',
        template: 'jobsList',
        waitOn: function () {
            var query = {};
            var companyId = Session.get('companyId');
            if(companyId){
                query.companyId = companyId;
            }
            return [
                this.subscribe('userJobs', query)
            ];
        },
        data: function () {
            var query = {isArchived: false};
            var companyId = Session.get('companyId');
            if(companyId){
                query.companyId = companyId;
            }
            return {
                pageTitle: 'Jobs',
                jobs: Jobs.find(query).fetch(),
                archivedJobs: Jobs.find({isArchived: true}).fetch(),
            };
        }
    });

    this.route('createJob', {
        path: '/job/create',
        layoutTemplate: 'mainLayout',
        template: 'creteEditJob',
        data: function () {
            return {
                pageTitle: 'Post a new job'
            };
        },
        waitOn: function () {
            return [this.subscribe('allSkills', false, true)];
        }
    });

    this.route('editJob', {
        path: '/job/:id/edit',
        layoutTemplate: 'mainLayout',
        template: 'creteEditJob',
        data: function () {
            return {
                job: Jobs.findOne(this.params.id),
                pageTitle: 'Edit job'
            };
        },
        waitOn: function () {
            return [
                this.subscribe('allSkills', false, true),
                this.subscribe('job', this.params.id)
            ];
        },
    });

    this.route('addLocation', {
        path: '/job/:id/add-location',
        layoutTemplate: 'mainLayout',
        template: 'workerLocation',
        waitOn: function () {
            return [
                this.subscribe('job', this.params.id),
                this.subscribe('allCountries')

            ];
        },
        data: function () {
            return {
                job: Jobs.findOne(this.params.id),
                pageTitle: 'Post a new job'
            };
        }
    });

    this.route('jobDetails', {
        path: '/job/:id',
        layoutTemplate: 'mainLayout',
        template: 'jobDetails',
        waitOn: function () {
            return [
                this.subscribe('job', this.params.id)
            ];
        },
        data: function () {
            return {
                job: Jobs.findOne(this.params.id),
                pageTitle: 'Job details'
            };
        }
    });

    this.route('jobOverview', {
        path: '/job/:id/overview',
        layoutTemplate: 'mainLayout',
        template: 'overviewJob',
        waitOn: function () {
            return [
                this.subscribe('job', this.params.id)
            ];
        },
        data: function () {
            return {
                job: Jobs.findOne(this.params.id),
                pageTitle: 'Post a new job'
            };
        }
    });

    this.route('purchaseJob', {
        path: '/jobs/purchase/:id',
        layoutTemplate: 'mainLayout',
        template: 'jobPurchase',
        waitOn: function () {
            this.subscribe('job', this.params.id);
        },
        data: function () {
            return {
                job: Jobs.findOne(this.params.id),
                pageTitle: 'Jobs'
            };
        }
    });
});