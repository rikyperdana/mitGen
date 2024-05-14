m.mount(document.body, mitGen({
  theme: 'journal',
  brand: {name: 'home', full: 'MitGen'},
  start: {
    download: {
      full: 'Download', icon: 'download',
      submenu: {
        github: {
          icon: 'code-branch',
          comp: x => [
            m('h1', 'Github Clone'),
            m('a', {
              href: 'https://github.com/rikyperdana/mitGen',
              target: '_blank'
            }, 'Github page of this library')
          ]
        },
        zip: {
          icon: 'file-archive',
          comp: x => [
            m('h1', 'Download Zip'),
            m('a', {
              href: 'https://github.com/rikyperdana/mitGen/archive/master.zip',
              target: '_blank'
            }, 'Get the bundled zip')
          ]
        }
      }
    },
    tutorials: {
      full: 'Tutorials', icon: 'chalkboard-teacher',
      comp: x => m('p', 'Have a look in app.js for how to use this library')
    },
    pricing: {
      full: 'Pricing', icon: 'tag',
      comp: x => m('p', 'Open source means that the freedom is yours.')
    },
    about: {
      full: 'About', icon: 'calendar',
      comp: x => m('p', 'Say hi to @rikyperdana on Github')
    },
    autoForm: {
      full: 'AutoForm', icon: 'file',
      comp: x => [
        m('h2', 'MitGen + AutoForm'),
        m('p', 'List all the apps you wish to create here.'),
        m(autoForm({
          id: 'wishList',
          action: console.log,
          schema: {
            wishList: {type: Array},
            'wishList.$': {type: String}
          }
        }))
      ]
    },
    autoTable: {
      full: 'AutoTable', icon: 'table',
      comp: x => [
        m('h2', 'MitGen + AutoTable'),
        m(autoTable({
          id: 'sample',
          heads: {
            one: 'First Column', two: 'Second Column',
            three: 'Third Column', four: 'Fourth Column'
          },
          rows: _.range(300).map(i => ({
            row: {
              one: `C1R${i}`, two: `C2R${i}`,
              three: `C3R${i}`, four: `C4R${i}`,
            },
            data: {anyKey: i}
          })),
          onclick: data => console.log(stringify(data)),
          showSteps: [10, 50, 100],
          search: true
        }))
      ]
    },
    database: {
      full: 'Database', icon: 'database',
      comp: x => [
        m('h2', 'Database Interaction'),
        m('p', 'MitGen + Simple JSONdb (coming soon)')
      ]
    }
  }
}))