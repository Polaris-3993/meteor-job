import './screenshot-modal.html';

Template.screenshotModal.onCreated(function () {
    var self = this;

    this.screens = new ReactiveVar([]);
    this.selectedScreenshot = new ReactiveVar({});

    this.getNormalScreens = function (screens) {
        _.each(screens, function (screeenTimeLine) {
            screeenTimeLine.screens = _.reject(screeenTimeLine.screens, function (screen) {
                return screen.deleted;
            });
        });
        screens = _.flatten(_.map(screens, function (screeenTimeLine) {
            return screeenTimeLine && screeenTimeLine.screens;
        }));
        return screens;
    };

    this.setPreviousScreenshot = function (screens, selectedScreenshot) {
        var prevIndex = _.indexOf(screens, selectedScreenshot);
        if (prevIndex != -1) {
            var previousScreenshot = screens[prevIndex - 1];
            if (previousScreenshot) {
                prevIndex = prevIndex + 1;
                previousScreenshot.index = prevIndex - 1;
                self.selectedScreenshot.set(previousScreenshot);
            }
        }
    };

    this.setNextScreenshot = function (screens, selectedScreenshot) {
        var nextIndex = _.indexOf(screens, selectedScreenshot);
        if (nextIndex != -1) {
            var nextScreenshot = screens[nextIndex + 1];
            if (nextScreenshot) {
                nextIndex = nextIndex + 1;
                nextScreenshot.index = nextIndex + 1;
                self.selectedScreenshot.set(nextScreenshot);
            }
        }
    };

    this.autorun(function () {
        var data = Template.currentData();
        var screensVar = data && data.screens && data.screens;
        var selectedScreenshot = data && data.screenshot;
        var screens = self.getNormalScreens(screensVar);
        var index = _.indexOf(screens, selectedScreenshot);
        selectedScreenshot.index = index + 1;
        self.screens.set(screens);
        self.selectedScreenshot.set(selectedScreenshot);
    });
});

Template.screenshotModal.onRendered(function () {
    var self = this;

    this.$('.modal').modal();
    this.$('.modal').modal('open');
    this.$('select').material_select();

    this.$('.lean-overlay').on('click', function () {
        self.screens.set([]);
        self.selectedScreenshot.set({});
        removeTemplate(self.view);
    });
    document.addEventListener('keyup', function (e) {
        var screens = self.screens.get();
        var selectedScreenshot = self.selectedScreenshot.get();
        if (e.keyCode == 27) {
            self.screens.set([]);
            self.selectedScreenshot.set({});
            removeTemplate(self.view);
        }

        if (e.keyCode == 37) {
            if (screens.length > 0 && _.keys(selectedScreenshot).length > 0) {
                self.setPreviousScreenshot(screens, selectedScreenshot);
            }
        }

        if (e.keyCode == 39) {
            if (screens.length > 0 && _.keys(selectedScreenshot).length > 0) {
                self.setNextScreenshot(screens, selectedScreenshot);
            }
        }

    });
});

Template.screenshotModal.onDestroyed(function () {
    this.$('.lean-overlay').remove();
    this.$('.modal').modal('close');
});

Template.screenshotModal.helpers({
    screenshot: function () {
        var tmpl = Template.instance();
        return tmpl.selectedScreenshot.get();
    },
    screensLength: function () {
        var tmpl = Template.instance();
        return tmpl.screens.get().length;
    }
});

Template.screenshotModal.events({
    'click .left-arrow': function (event, tmpl) {
        event.preventDefault();
        var screens = tmpl.screens.get();
        var selectedScreenshot = tmpl.selectedScreenshot.get();
        if (screens.length > 0 && _.keys(selectedScreenshot).length > 0) {
            tmpl.setPreviousScreenshot(screens, selectedScreenshot);
        }
    },
    'click .right-arrow': function (event, tmpl) {
        event.preventDefault();
        var screens = tmpl.screens.get();
        var selectedScreenshot = tmpl.selectedScreenshot.get();
        if (screens.length > 0 && _.keys(selectedScreenshot).length > 0) {
            tmpl.setNextScreenshot(screens, selectedScreenshot);
        }
    }
});

var removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};
