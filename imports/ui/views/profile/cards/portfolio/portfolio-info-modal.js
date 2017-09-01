import { VZ } from '/imports/startup/both/namespace';
import './portfolio-info-modal.html';

Template.portfolioInfoModal.onCreated(function () {

});
Template.portfolioInfoModal.onRendered(function () {
    var self = this;
    this.$('.modal').modal();
    this.$('.modal').modal('open');

    $('.lean-overlay').on('click', function () {
        removeTemplate(self.view);
    });
    document.addEventListener('keyup', function (e) {
        if (e.keyCode == 27) {
            removeTemplate(self.view);
        }
    });
});
Template.portfolioInfoModal.onDestroyed(function () {
    $('.lean-overlay').remove();
});
Template.portfolioInfoModal.helpers({
    formatDate: function (date) {
        return moment(date).format('MMMM YYYY');
    },
    profileOwner: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        return user && Meteor.userId() == user._id;
    }
});
Template.portfolioInfoModal.events({
    'click .close': function (event, tmpl) {
        event.preventDefault();
        tmpl.$('#portfolio-detail-modal').modal('close');
        removeTemplate(tmpl.view);
    },
    'click .edit': function (event, tmpl) {
        event.preventDefault();
        var portfolioId = tmpl.data.portfolioProject._id;
        var parentNode = $('body')[0],
            onPortfolioEdit = function (portfolio, portfolioTmpl) {
                Meteor.call('updatePortfolioProject', portfolioId, portfolio, function (error, result) {
                    if (!error) {
                        portfolioTmpl.$('#edit-portfolio-modal').modal('close');
                        removeTemplate(portfolioTmpl.view);
                        VZ.notify('Success');
                    }
                    else {
                        VZ.notify(error.message.replace(/[[0-9]+]/gi, '').replace('[', '').replace(']', ''));
                    }
                });
            },
            modalData = {
                portfolioProject: tmpl.data.portfolioProject,
                onPortfolioEdit: onPortfolioEdit
            };
        Blaze.renderWithData(Template.editPortfolioModal, modalData, parentNode);
        tmpl.$('#portfolio-detail-modal').modal('close');
        removeTemplate(tmpl.view);
    }
});

var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};