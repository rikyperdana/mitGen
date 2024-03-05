/*global m Chart makeArray*/

var chartSamples = m('.columns', [
  m('.column', [
    m('h3', 'Bar Report'), m('canvas', {
      id: 'statLine', height: 100, oncreate: x => new Chart(
        document.getElementById('statLine'), {
          options: {scales: {y: {beginAtZero: true}}},
          type: 'bar', data: {
            labels: ['Jan', 'Feb', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
            datasets: [{
              label: 'Monthly Progress',
              data: makeArray(12).map(i => Math.ceil(Math.random() * 10)),
              borderWidth: 1,
            }]
          }
        }
      )
    })
  ]),
  m('.column', [
    m('h3', 'Line Report'), m('canvas', {
      id: 'statPie', height: 100, oncreate: x => new Chart(
        document.getElementById('statPie'), {
          options: {scales: {y: {beginAtZero: true}}},
          type: 'line', data: {
            labels: ['Jan', 'Feb', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
            datasets: [{
              label: 'Monthly Report',
              data: makeArray(12).map(i => Math.ceil(Math.random() * 10)),
              borderWidth: 1,
            }]
          }
        }
      )
    })
  ])
])