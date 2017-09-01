import { Tools } from '/imports/api/tools/tools';
import './tools-search.html';

Template.toolsSearch.helpers({
    tools: function () {
        return Tools.find().fetch();
    }
});