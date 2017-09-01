import './all-search.html';

Template.allSearch.onRendered(function () {
    // console.log(this.data)
});

Template.allSearch.helpers({
    tabs: function () {
        var tabs = this.tabs;
        var data = this
        
        if(this.pageParams.category){
            return _.sortBy(tabs, function(tab){
                return tab.title.toLocaleLowerCase() != data.pageParams.category
            })
        }
        return this.tabs
    },
    
    tabData: function () {
        return {
            pageParams: this.pageParams,
            showHeader: true
        }
    }
});