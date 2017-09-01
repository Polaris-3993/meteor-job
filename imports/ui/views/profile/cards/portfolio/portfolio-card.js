import { VZ } from '/imports/startup/both/namespace';
import { Projects } from '/imports/api/projects/projects';
import { UserPortfolioProjects } from '/imports/api/userPortfolioProjects/userPortfolioProjects';
import './portfolio-card.html';

Template.portfolioCard.onCreated(function () {
    var self = this;
    this.projectsLimit = new ReactiveVar(3);
    this.searchQuery = new ReactiveVar({});

    this.autorun(function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (user && user.profile && user.profile.portfolioProjects) {
            var searchQuery = {
                _id: {
                    $in: user.profile.portfolioProjects || []
                }
            };
            self.subscribe('userPortfolioProjects', user.profile.portfolioProjects);
            self.searchQuery.set(searchQuery);
        }
    });
});
Template.portfolioCard.onRendered(function () {
    var self = this;
    this.$('.dropdown-button').dropdown({
            inDuration: 200,
            outDuration: 125,
            constrain_width: false, // Does not change width of dropdown to that of the activator
            hover: false, // Activate on hover
            gutter: 0, // Spacing from edge
            belowOrigin: false, // Displays dropdown below the button
            alignment: 'left' // Displays dropdown with edge aligned to the left of button
        }
    );
    this.autorun(function () {
        self.searchQuery.get();
    })
});
Template.portfolioCard.helpers({
    userPortfolioProjects: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (user.profile.portfolioProjects) {
            var portfolioProjects = Template.instance().searchQuery.get();
            return UserPortfolioProjects.find(portfolioProjects, {
                sort: {
                    createdAt: -1
                },
                limit: Template.instance().projectsLimit.get()
            });
        }
    },
    showLess: function () {
        var portfolioProjectsQuery = Template.instance().searchQuery.get();

        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        var portfolioProjects = UserPortfolioProjects.find(portfolioProjectsQuery, {
            sort: {
                createdAt: -1
            }
        }).count();
        if (user.profile.portfolioProjects) {
            if(_.has(portfolioProjectsQuery, 'skills')){
                return Template.instance().projectsLimit.get() == portfolioProjects && Template.instance().projectsLimit.get() > 3;
            }else {
                return Template.instance().projectsLimit.get() == user.profile.portfolioProjects.length && Template.instance().projectsLimit.get() > 3;
            }
        }
    },
    showMore: function () {
        var portfolioProjectsQuery = Template.instance().searchQuery.get();
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        var portfolioProjects = UserPortfolioProjects.find(portfolioProjectsQuery, {
            sort: {
                createdAt: -1
            }
        }).count();
        if (user.profile.portfolioProjects) {
            if(_.has(portfolioProjectsQuery, 'skills')){
                return Template.instance().projectsLimit.get() < portfolioProjects;
            }
            else {
                return Template.instance().projectsLimit.get() < user.profile.portfolioProjects.length;
            }
        }
    },
    profileOwner: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        return user && Meteor.userId() == user._id;
    },
    portfolioCategories: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        if (user.profile.portfolioProjects) {
            var userPortfolioProjects = UserPortfolioProjects.find({
                _id: {
                    $in: user.profile.portfolioProjects || []
                }
            }).fetch();
            return _.union(_.flatten(_.map(userPortfolioProjects, function (project) {
                return project.skills;
            })));
        }
    },
    categoryName: function () {
        return Template.instance().searchQuery.get().skills || 'All categories';
    }

});
Template.portfolioCard.events({
    'click .edit-portfolio': function (event, tmpl) {
        event.preventDefault();
        var portfolioId = this._id;
        var portfolioProject = UserPortfolioProjects.findOne({_id: portfolioId});
        var parentNode = $('body')[0],
            onPortfolioEdit = function (portfolio, portfolioTmpl) {
                Meteor.call('updatePortfolioProject', portfolioId, portfolio, function (error, result) {
                    if (!error) {
                        portfolioTmpl.$('#edit-portfolio-modal').modal('close');
                        removeTemplate(portfolioTmpl.view);
                        VZ.notify('Success');
                    }
                    else {
                        VZ.notify(error.message.replace(/[[0-9]+]/gi, ''));
                    }
                });
            },
            modalData = {
                portfolioProject: portfolioProject,
                onPortfolioEdit: onPortfolioEdit
            };
        Blaze.renderWithData(Template.editPortfolioModal, modalData, parentNode);
    },

    'click .add-portfolio': function (event, tmpl) {
        event.preventDefault();
        var parentNode = $('body')[0],
            onPortfolioInsert = function (portfolio, portfolioTmpl) {
                Meteor.call('insertPortfolioProject', portfolio, function (error, result) {
                    if (!error) {
                        portfolioTmpl.$('#edit-portfolio-modal').modal('close');
                        removeTemplate(portfolioTmpl.view);
                        VZ.notify('Success');
                        tmpl.projectsLimit.set(3);
                    }
                    else {
                        VZ.notify(error.message.replace(/[[0-9]+]/gi, ''));
                    }
                });
            },
            modalData = {
                onPortfolioInsert: onPortfolioInsert
            };
        Blaze.renderWithData(Template.editPortfolioModal, modalData, parentNode);
    },
    'click .load-more': function (event, tmpl) {
        event.preventDefault();
        var portfolioProjectsQuery = tmpl.searchQuery.get();
        var projectsToShow;
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        var portfolioProjects = UserPortfolioProjects.find(portfolioProjectsQuery, {
            sort: {
                createdAt: -1
            }
        }).count();
        if(_.has(portfolioProjectsQuery, 'skills')){
            projectsToShow = portfolioProjects || 3;
        }
        else {
            projectsToShow = user.profile.portfolioProjects.length || 3;
        }
        tmpl.projectsLimit.set(projectsToShow);
    },
    'click .show-less': function (event, tmpl) {
        event.preventDefault();
        tmpl.projectsLimit.set(3);
    },
    'click .delete-portfolio': function (event, tmpl) {
        event.preventDefault();
        var portfolioId = this._id;
        Meteor.call('removePortfolioProject', portfolioId);
        tmpl.projectsLimit.set(3);
    },
    'click .show-portfolio-info': function (event, tmpl) {
        event.preventDefault();
        var portfolioId = this._id;
        var portfolioProject = UserPortfolioProjects.findOne({_id: portfolioId});
        var parentNode = $('body')[0],
            modalData = {
                portfolioProject: portfolioProject
            };
        Blaze.renderWithData(Template.portfolioInfoModal, modalData, parentNode);
    },
    'click .portfolio-category': function (event, tmpl) {
        event.preventDefault();
        var newQuery;
        var category = tmpl.$(event.currentTarget).data().name;
        var searchQuery = tmpl.searchQuery.get();
        if(category == 'all'){
            newQuery = _.omit(searchQuery, 'skills');
        }
        else{
            newQuery = _.extend(searchQuery, {skills: category});
        }
        tmpl.searchQuery.set(newQuery);
        tmpl.projectsLimit.set(3);
    }
});

var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};