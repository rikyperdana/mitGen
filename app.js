m.mount(document.body, mitGen({
  brand: { // only have 1 menu
    name: 'home', full: 'Mithril App',
    // comp: () => m('h1', 'Home')
  },
  start: { // may have menus of menus
    download: {icon: 'download', children: {
      github: {icon: 'code-branch', comp: () => [
        m('h1', 'GitHub Clone'),
        m('a',
          {href: 'https://github.com/rikyperdana/mitGen'},
          'Github page of this library'
        )
      ]},
      zip: {icon: 'file-archive', comp: () => [
        m('h1', 'Download Zip'),
        m('a',
          {href: 'https://github.com/rikyperdana/mitGen/archive/master.zip'},
          'Get the bundled zip'
        )
      ]}
    }},
    tutorials: {
      icon: 'chalkboard-teacher',
      comp: () => m('p', 'Have a look in app.js of how to use this library')
    },
    pricing: {
      icon: 'tag',
      comp: () => m('p', 'Open source means that the freedom is yours.')
    },
    about: {
      full: 'About Us', icon: 'users',
      comp: () => m('p', 'Say hi to @rikyperdana on Github/Twitter')
    },
    autoForm: {
      icon: 'file-invoice', comp: () => [
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
      icon: 'table', comp: () => [
        m('h2', 'MitGen + AutoTable'),
        m(autoTable({
          heads: {one: 'Column 1', two: 'Column 2', three: 'Column 3', four: 'Column 4', five: 'Column 5'},
          rows: [
            {row: {one: 'row 1', two: 'row 1', three: 'row 1', four: 'row 1', five: 'row 1'}, data: {any: 'data1'}},
            {row: {one: 'row 2', two: 'row 2', three: 'row 2', four: 'row 2', five: 'row 2'}, data: {any: 'data2'}},
          ],
          onclick: data => console.log(data)
        }))
      ]
    }
  },
  end: { // may have 1 children menu
    name: 'user', full: 'User Menu',
    comp: () => m('h1', 'User Profile'),
    children: {
      login: {full: 'Sign In/Up', icon: 'sign-in-alt'},
      profile: {
        icon: 'address-card',
        comp: () => m('h1', 'My Profile')
      },
      subs: {full: 'Subscription', icon: 'rss'},
      logout: {icon: 'sign-out-alt'}
    }
  },
}, {theme: 'united'}))
