import { VZ } from '/imports/startup/both/namespace';
import './mini-browser-tool.html';

Template.miniBrowserTool.onCreated(function () {
    this.url = new ReactiveVar();
    this.workplaceId = this.data.lmTemplate.workplaceId;
});

Template.miniBrowserTool.onRendered(function () {
    this.$('iframe').prop('src', this.data.component.config.componentState.historyUrl);
    this.$('.url-input').val(this.data.component.config.componentState.historyUrl);
    this.$('iframe').error(function () {
        VZ.notify('Pasted site blocking his view for other sites');
    });
});

Template.miniBrowserTool.helpers({
    src: function () {
        return Template.instance().url.get();
    }
});

Template.miniBrowserTool.events({
    'submit #urlField': function (event, tmpl) {
        var updateState = function () {
            tmpl.url.set(url);
            tmpl.data.component.config.componentState.historyUrl = url;
            var state = tmpl.data.lmTemplate.myLayout.toConfig();
            Meteor.call('updateState', tmpl.workplaceId, state);
        };

        event.preventDefault();
        var url = tmpl.$('.url-input').val();

        var urlRegEx = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        var parsedUrl = urlRegEx.exec(url);

        if (parsedUrl) {
            if (!_.isString(parsedUrl[1])) {
                url = 'http://' + url;
            }
            updateState();
        }
    }
});