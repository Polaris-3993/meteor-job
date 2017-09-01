import './show-card.html';

Template.showCard.onRendered(function () {
    Template.profileCardList.updateMasonry();
});
