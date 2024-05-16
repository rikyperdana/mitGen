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
  },
  end: {
    full: 'User Account', icon: 'user',
    submenu: Object.fromEntries([
      !localStorage.getItem('userCreds') && ['signin', {
        full: 'Sign In', icon: 'sign-in',
        comp: x => [
          m('h2', 'Already have an account'),
          m(autoForm({
            id: 'signin',
            schema: {
              username: {type: String},
              password: {type: String, autoform: {type: 'password'}}
            },
            submit: {value: 'Sign In'},
            action: doc => io().emit(
              'signin', doc, res => [
                localStorage.setItem(
                  'userCreds', JSON.stringify(res)
                ), mgState = {}, m.redraw()
              ]
            )
          }))
        ]
      }],
      localStorage.getItem('userCreds') && ['signout', {
        full: 'Sign Out', icon: 'sign-out',
        comp: x => m('p', {
          oncreate: x => io().emit('signout', JSON.parse(
            localStorage.getItem('userCreds') || '{}'
          ), res => [
            localStorage.removeItem('userCreds'),
            mgState = {}, m.redraw()
          ])
        }, 'Signed out.')
      }],
      !localStorage.getItem('userCreds') && ['signup', {
        full: 'Sign Up', icon: 'door-open',
        comp: x => [
          m('h2.has-text-centered', 'Register new user'),
          m(autoForm({
            id: 'signup',
            schema: {
              username: {type: String},
              password: {type: String, autoform: {type: 'password'}}
            },
            submit: {value: 'Sign Up'},
            action: doc => io().emit('signup', doc, res => [
              mgState = {}, m.redraw(),
              alert('Sign up successful. Please sign in.')
            ])
          }))
        ]
      }]
    ].filter(Boolean))
  }
}))