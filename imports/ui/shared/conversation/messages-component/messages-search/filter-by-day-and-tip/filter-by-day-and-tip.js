import './filter-by-day-and-tip.html';

Template.filterByDayAndTip.onCreated(function () {
    this.shouldShowTip = new ReactiveVar(true);
    this.filterByDayValue = new ReactiveVar('allTime');

    var self = this;
    this.autorun(function () {
        self.data.onChangeFilterByDay(self.filterByDayValue.get());
    });
});

Template.filterByDayAndTip.onRendered(function () {
    this.$('.filter-dropdown').dropdown();
});

Template.filterByDayAndTip.helpers({
    shouldShowTip: function () {
        return Template.instance().shouldShowTip.get();
    },

    filterByDaySelectedValue: function () {
        switch (Template.instance().filterByDayValue.get()) {
            case 'allTime':
                return 'All Time';
            case 'today':
                return 'Today';
            case 'week':
                return 'This week';
            case 'month':
                return 'This month';
        }
    }
});

Template.filterByDayAndTip.events({
    'click .close-message': function (event, tmpl) {
        tmpl.shouldShowTip.set(false);
    },

    'click #filter-dropdown li': function (event, tmpl) {
        var value = event.currentTarget.id;
        tmpl.filterByDayValue.set(value);
    }
});