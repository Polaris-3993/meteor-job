import './edit-card.html';

Template.editCard.onRendered(function () {
    Template.profileCardList.updateMasonry();
});

Template.editCard.events({
    'input .materialize-textarea': function () {
        Template.profileCardList.updateMasonry();
    }
});