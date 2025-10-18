const userMenu = {
  full: 'User Account', icon: 'user',
  submenu: Object.fromEntries([
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
          action: doc => io('/user').emit('signup', doc, res => [
            mgState = {}, m.redraw(),
            alert('Sign up successful. Please sign in.')
          ])
        }))
      ]
    }],
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
          action: doc => io('/user').emit(
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
      comp: x => m('a', {
        oncreate: x => io('/user').emit('signout', JSON.parse(
          localStorage.getItem('userCreds') || '{}'
        ), res => [
          localStorage.removeItem('userCreds'),
          mgState = {}, m.redraw()
        ])
      }, '')
    }]
  ].filter(Boolean))
}
