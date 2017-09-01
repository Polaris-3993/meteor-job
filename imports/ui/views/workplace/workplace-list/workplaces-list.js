import { Workplaces } from  '/imports/api/workPlaces/workPlaces';
import './workplaces-list.html';
import './workplace-card/workplace-card';

Template.workplacesList.onCreated(function () {
    this.activeCardsCount = new ReactiveVar(0);
});

Template.workplacesList.onRendered(function () {
});

Template.workplacesList.helpers({
    workplaces: function () {
        var workplaces = Workplaces.find().fetch();
        return _.sortBy(workplaces, function (workplace) {
            return workplace.name.toLowerCase();
        });
    },
    
    isActiveMoreThenOneCard: function () {
        return Template.instance().activeCardsCount.get() > 1;
    },
    
    actionItems: function () {
        return [
            {
                iconName: 'list',
                action: function () {
                }
            }, {
                iconName: 'input',
                action: function () {
                }
            }, {
                iconName: 'list',
                action: function () {
                }
            }, {
                iconName: 'input',
                action: function () {
                }
            }
        ]
    }
});


Template.workplacesList.events({
    
    'click .workplace-item' : function(event,tmpl) {

        var $workplaceItem = $(event.currentTarget);
        /* Set Card as Active */
        $workplaceItem.toggleClass('active');

        /* Counting Number of active Worspaces*/
        var activeCards = $('.workplace-item.active').length;
        
        tmpl.activeCardsCount.set(activeCards);
  
    }
    // 'change #google-file': function (e, t) {
    //     var file = $(e.target).prop('files')[0];
    //     console.log(file);
    //     var reader = new FileReader();
    //     reader.onload = function (e) {
    //         var uploadData = {}
    //         var data = new Uint8Array(reader.result)
    //         //console.log(data)
    //         uploadData.data = data;
    //         uploadData.name = file.name;
    //         uploadData.type = file.type;
    //         uploadData.size = file.size;
    //         Meteor.call('uploadFile', uploadData, function (err) {
    //             if(err){
    //                 console.log(err);
    //                 VZ.notify('UPLOAD FAILED')
    //             } else {
    //                 VZ.notify('UPLOAD SUCCESS');
    //             }
    //         })
    //     };
    //     reader.readAsArrayBuffer(file);
    // }
});