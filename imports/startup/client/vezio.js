
import { VZ } from '/imports/startup/both/namespace';

Meteor.startup(function () {
    TimeSync.loggingEnabled = false;
    VZ.TimeTracker.instance = VZ.TimeTracker.Utils.TimeTracker();
});

// utils function
function addZero(number) {
    if(number < 10) {
        return '0' + number;
    } else {
        return number;
    }
}

Template.registerHelper('formatSecondsAsTime', function (secs) {
    if (secs < 1) {return '-';}

    var hr  = Math.floor(secs / 3600);
    var min = Math.floor((secs - (hr * 3600))/60);
    var sec = Math.floor(secs - (hr * 3600) -  (min * 60));

    if (hr) {hr = hr + 'h '} else {hr = ''}
    if (min) {min = min + 'm '} else {min = ''}
    if (sec) {sec = sec + 's'} else {sec = ''}

    return hr + min + sec;
});

Template.registerHelper('formatSecondsAsTimeProjects', function (secs) {
    if(secs <= 0) {
        return '00:00';
    }
    const hr = Math.floor(secs / 3600);
    const min = Math.floor((secs - (hr * 3600)) / 60);
    const sec = Math.floor(secs - (hr * 3600) - (min * 60));

    //if(hr > 0) {
    return addZero(hr) + ":" +  addZero(min);
    //} else {
    //  return `${addZero(min)}m ${addZero(sec)}s`;
    //}
});

Template.registerHelper('formatSecondsAsTimeTasks', function (secs) {
    if (secs < 1) {return '0:00';}

    var hr  = Math.floor(secs / 3600);
    var min = Math.floor((secs - (hr * 3600))/60);
    var sec = Math.floor(secs - (hr * 3600) -  (min * 60));

    if (hr) {hr = hr + 'h '} else {hr = ''}
    if (min) {min = min + 'm '} else {min = ''}
    if (sec) {sec = sec + 's'} else {sec = ''}

    return hr + min + sec;
});

Template.registerHelper('formatSecondsAsTimeTask', function (secs) {
    if (secs < 1) {
        return '00:00:00';
    }

    var hr = Math.floor(secs / 3600);
    var min = Math.floor((secs - (hr * 3600)) / 60);
    var sec = Math.floor(secs - (hr * 3600) - (min * 60));

    if (hr) {
        if(hr <= 9){
            hr = '0'+hr;
        }
    } else {
        hr = '00'
    }
    if (min) {
        if(min <= 9){
            min = '0'+min;
        }
    } else {
        min = '00'
    }
    if (sec) {
        if(sec <= 9){
            sec = '0'+sec;
        }
    } else {
        sec = '00'
    }

    return hr + ':' + min + ':' + sec;
});

Template.registerHelper('formatSecondsAsActivityCard', function (secs) {
    if (secs < 1) {
        return '0:00';
    }

    var hr = Math.floor(secs / 3600);
    var min = Math.floor((secs - (hr * 3600)) / 60);

    if (hr) {
        if(hr <= 9){
            hr = '0'+hr;
        }
    } else {
        hr = '0'
    }
    if (min) {
        if(min <= 9){
            min = '0'+min;
        }
    } else {
        min = '00'
    }

    return hr + ':' + min;
});