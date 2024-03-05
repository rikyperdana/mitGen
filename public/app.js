/*global _ m mitGen autoForm autoTable chartSamples*/

m.mount(document.body, mitGen({
  theme: 'journal',
  brand: {name: 'home', full: 'MitGen'},
  start: { // may have menus of menus
    download: {
      icon: 'download',
      full: 'Download',
      submenu: {
        github: {icon: 'code-branch', comp: () => [
          m('h1', 'GitHub Clone'),
          m('a',
            {href: 'https://github.com/rikyperdana/mitGen', target: '_blank'},
            'Github page of this library'
          )
        ]},
        zip: {icon: 'file-archive', comp: () => [
          m('h1', 'Download Zip'),
          m('a',
            {href: 'https://github.com/rikyperdana/mitGen/archive/master.zip', target: '_blank'},
            'Get the bundled zip'
          )
        ]}
      }
    },
    tutorials: {
      full: 'Tutorials',
      icon: 'chalkboard-teacher',
      comp: () => m('p', 'Have a look in app.js of how to use this library')
    },
    pricing: {
      full: 'Pricing',
      icon: 'tag',
      comp: () => m('p', 'Open source means that the freedom is yours.')
    },
    about: {
      full: 'About', icon: 'calendar',
      comp: () => m('p', 'Say hi to @rikyperdana on Github/Twitter')
    },
    autoForm: {
      full: 'AutoForm',
      icon: 'file', comp: () => [
        m('h2', 'MitGen + AutoForm'),
        m('p', 'List apps you wish to create with this library:'),
        m(autoForm({
          id: 'wishList', action: console.log,
          schema: {
            wishList: {type: Array},
            'wishList.$': {type: String}
          }
        }))
      ]
    },
    autoTable: {
      full: 'AutoTable',
      icon: 'table', comp: () => [
        m('h2', 'MitGen + AutoTable'),
        m(autoTable({
          id: 'sample',
          heads: {one: 'Column 1', two: 'Column 2', three: 'Column 3', four: 'Column 4', five: 'Column 5'},
          rows: _.range(300).map(i => ({
            row: {one: 'row '+i, two: 'row '+i, three: 'row '+i, four: 'row '+i, five: 'row '+i}, data: {anyKey: 'anyValue '+i}
          })),
          onclick: data => alert(JSON.stringify(data)),
          showSteps: [10, 50, 100], search: true
        }))
      ]
    }
  },
  end: { // may have 1 submenu menu
    name: 'user', full: 'User Menu',
    comp: () => m('h1', 'User Profile'),
    submenu: {
      login: {full: 'Sign In/Up', icon: 'sign-in-alt'},
      profile: {
        icon: 'address-card',
        comp: () => m('h1', 'My Profile')
      },
      subs: {full: 'Subscription', icon: 'rss'},
      logout: {icon: 'sign-out-alt'}
    }
  },
  below: chartSamples
}))