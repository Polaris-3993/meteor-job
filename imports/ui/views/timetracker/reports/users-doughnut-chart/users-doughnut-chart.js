import './users-doughnut-chart.html';

Template.usersDoughnutChart.onRendered(function () {
    var chartEl = this.$('#usersChart').get(0).getContext('2d');
    var data = [{
        value: 5.6,
        color: '#F7464A',
        highlight: '#FF5A5E',
        label: 'Yura Srohiy'
    }, {
        value: 6.5,
        color: '#46BFBD',
        highlight: '#5AD3D1',
        label: 'Ihor Barmak'
    }, {
        value: 7.3,
        color: '#FDB45C',
        highlight: '#FFC870',
        label: 'Bodya'
    }];

    var options = {
        responsive: true
    };
    var projectsChart = new Chart(chartEl).Doughnut(data, options)
});