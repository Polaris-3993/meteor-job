import './work-bar-chart.html';

import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
Template.workBarChart.onCreated(function () {
    var self = this;
});

Template.workBarChart.onRendered(function () {
    var self = this;
    var chartEl = this.$('#workBarChart').get(0).getContext('2d');

    var initChart = function () {
        var data = chartData(self);
        var options = chartOptions(data.datasets[0].data);

        if (self.workBarChart) {
            self.workBarChart.destroy();
        }
        self.workBarChart = new Chart(chartEl).Bar(data, options);
    };
    this.updateChartInterval = setInterval(function () {
        initChart();
    }, 60 * 1000);

    setTimeout(function () {
        initChart();
    }, 100)
});

Template.workBarChart.onDestroyed(function () {
    clearInterval(this.updateChartInterval);
});

var chartData = function (tmpl) {
    var dataRange = tmpl.data && tmpl.data.dateRange && tmpl.data.dateRange.get() || tmpl.data.get();
    var userId = tmpl.data && tmpl.data.userId && tmpl.data.userId.get() || Meteor.userId();
    var data = {
        datasets: [{
            label: 'Work Hours',
            fillColor: 'rgb(52,128,255)',
            strokeColor: 'rgb(52,128,255)',
            highlightFill: 'rgb(52,128,255)',
            highlightStroke: 'rgb(52,128,255)'
        }]
    };

    switch (dataRange.range) {
        case 'Weekly':
            data.labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            data.datasets[0].data = calculateData(dataRange, 7, 'isoweek', 'day', userId);
            break;
        case 'Monthly':
            var monthDay = moment(tmpl.data.dateRange.get().date).startOf('month');
            var daysCount = moment(tmpl.data.dateRange.get().date).endOf('month').date();
            data.labels = [];
            data.datasets[0].data = calculateData(dataRange, daysCount, 'month', 'day', userId);

            for (var i = 0; i < daysCount; i++) {
                var format = moment(monthDay).format('ddd Do');
                format = format.replace(' ', '\n');
                data.labels.push(format);
                monthDay.add(1, 'd');
            }
            break;
        case 'Quarterly':
            var quarterDay = moment(tmpl.data.dateRange.get().date).startOf('quarter');
            data.labels = [];
            data.datasets[0].data = calculateData(dataRange, 3, 'quarter', 'month', userId);
            var months = moment.months();
            for (var i = 0; i < 3; i++) {
                var monthNumber = moment(quarterDay).month();
                data.labels.push(months[monthNumber]);
                quarterDay.add(1, 'M')
            }
            break;
        case 'Yearly':
            var yearDay = moment(tmpl.data.dateRange.get().date).startOf('year');
            data.labels = moment.months();
            data.datasets[0].data = calculateData(dataRange, 12, 'year', 'month', userId);
            break;
        default:
            console.error('unexpected view type : ', dataRange.range);

    }

    return data;
};

var calculateData = function (dateRange, daysCount, range, barRange, userId) {
    var day = moment(dateRange.date).startOf(range).toDate();
    var resultArray = [];
    for (var i = 0; i < daysCount; i++) {
        var timeEntries = TimeEntries.find({
            userId: userId,
            startDate: {
                $gte: day,
                $lte: moment(day).endOf(barRange).toDate()
            }
        }).fetch();
        var sumHours = 0;
        _.each(timeEntries, function (entry) {
            var diff = moment(entry.endDate).diff(entry.startDate);
            sumHours += diff;
        });
        if (sumHours > 0) {
            sumHours = sumHours / 1000 / 60 / 60;
        }
        resultArray.push(sumHours);
        day = moment(day).add(1, barRange).toDate();
    }

    return resultArray;
};


var chartOptions = function (dataArray) {
    var maxHours = parseInt(_.max(dataArray)) + 1,
        step,
        spacing;

    if (maxHours < 10) {
        step = 0.5;
    }
    else if (maxHours < 25) {
        step = 1;
    }
    else if (maxHours < 100) {
        step = 5;

    }
    else if (maxHours < 200) {
        step = 200 / 10;
    }
    else {
        step = 25;
    }

    var chartSteps = parseInt(maxHours / step);
    if (dataArray.length <= 3) {
        spacing = 50;
    }
    else if (dataArray.length <= 12) {
        spacing = 20;
    }
    else {
        spacing = 5;
    }

    var options = {
        responsive: true,
        barValueSpacing: spacing,
        scaleOverride: true,
        scaleSteps: chartSteps,
        scaleStepWidth: step,
        tooltipTemplate: '<%if (label){%><%=label%>: <%}%><%= VZ.formatChartLabel(value) %>'
    };

    return options;
};

// formatBarLabel = function(value) {
//     var ms = value * 60 * 60 * 1000
//     var hours = parseInt(moment.duration(ms).asHours());
//     if(hours<10){
//         hours='0'+hours;
//     }
//     return hours + moment.utc(ms).format(':mm:ss')
// }
