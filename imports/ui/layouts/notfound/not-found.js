import './not-found.html';
import './not-found-layout.html';

Template.notFound.events({
    'click .home-page': function () {
        Router.go('home');
    }
});
