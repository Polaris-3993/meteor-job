import { VZ } from '/imports/startup/both/namespace';
import { Tools } from '/imports/api/tools/tools';
import { Workplaces } from  '/imports/api/workPlaces/workPlaces';
import './workplace.html';


Template.workplace.onCreated(function () {
    defineTools(this);
    this.workplaceId = Router.current().params.id;
});

Template.workplace.onRendered(function () {
    var self = this;
    var navBarHeight = $('nav').height();
    var layoutHeight = $(document).height() - navBarHeight - 2;
    $('#layoutWrapper').css('height', layoutHeight + 'px');
    //var config = standartConfig();
    var workplace = Workplaces.findOne({
        _id: self.workplaceId
    });

    if (workplace && workplace.state) {
        self.myLayout = new GoldenLayout(workplace.state, document.getElementById('layoutWrapper'));
    }
    else {
        self.myLayout = new GoldenLayout({
            content: []
        }, document.getElementById('layoutWrapper'));
    }
    self.myLayout.on('componentCreated', function (context) {
        launchObserver(context, self);
    });

    self.myLayout.on('stateChanged', function (context) {
        var workplaceId = self.workplaceId,
            state = self.myLayout.toConfig();
        Meteor.call('updateState', workplaceId, state);
    });
    registerComponents(self);
    try {
        self.myLayout.init();
    }
    catch (err) {
        self.myLayout.config.content = [];
        self.myLayout.init();
        VZ.notify('Failed to load saved state. Some of tools were deleted');
    }
    setDragingTools(self);

    $(window).resize(function () {
        navBarHeight = $('nav').height();
        layoutHeight = $(window).height() - navBarHeight - 2;
        $('#layoutWrapper').css('height', layoutHeight + 'px');
        self.myLayout.updateSize();
    });
});

Template.workplace.helpers({
    tools: function () {
        return Template.instance().tools;
    }
});

Template.workplace.onDestroyed(function () {

    this.myLayout.destroy();
});

var defineTools = function (tmpl) {
    var workplaceId = Router.current().params.id,
        workplace = Workplaces.findOne({
            _id: workplaceId
        });
    if (workplace && workplace.tools) {
        var tools = workplace.tools;
        tools = _.map(tools, function (tool) {

            var tempTool = Tools.findOne({
                _id: tool._id
            });
            if (tool.data) {
                tempTool.data = tool.data;
            }
            return tempTool;
        });
        tmpl.tools = tools;
    }
};

var registerComponents = function (tmpl) {
    _.each(tmpl.tools, function (tool) {
        tmpl.myLayout.registerComponent(tool.name, function (container, componentState) {
            container.getElement().append('<div class="' + componentState.id + '"></div>');
        });
    });
};

var setDragingTools = function (tmpl) {
    var tools = $('#menuWrapper >');

    _.each(tools, function (tool, index) {
        var element = $(tool);
        var config = {
            type: 'component',
            componentName: element.context.textContent,
            componentState: {
                id: element.attr('class'),
            }
        };
        if (tmpl.tools[index].data) {
            config.componentState.data = tmpl.tools[index].data;
        }
        if (tmpl.tools[index].subscriptions) {
            config.componentState.subscriptions = tmpl.tools[index].subscriptions;
        }
        tmpl.myLayout.createDragSource(element, config);
    });
};

var launchObserver = function (context, tmpl) {
    var data = {
        data: context.config.componentState.data,
        component: context,
        lmTemplate: tmpl
    }
    var subscriptions = context.config.componentState.subscriptions;
    var layoutClass = context.config.componentState.id;
    var target = document.querySelector('.lm_goldenlayout');
    var obsConfig = {
        childList: true,
        subtree: true
    };
    // if(!target){
    //     target = document.querySelector('#layoutWrapper');
    // }

    var observer = new MutationObserver(function (mutations) {
        inspectPage(layoutClass, subscriptions, data, observer);
    });
    observer.observe(target, obsConfig);

    inspectPage(layoutClass, subscriptions, data, observer);
};

var inspectPage = function (layoutClass, subscriptions, data, observer) {
    var items = $('.lm_goldenlayout').find('.lm_content');
    _.each(items, function (item) {
        item = $(item).children();
        if (item.attr('class') == layoutClass) {
            if (!item.children()[0]) {
                _.each(subscriptions, function (sub) {
                    Meteor.subscribe(sub);
                });
                if (data) {
                    Blaze.renderWithData(Template[layoutClass], data, item[0]);
                }
                else {
                    Blaze.render(Template[layoutClass], item[0]);
                }
                if (observer) {
                    observer.disconnect();
                }
            }
        }
    })
};