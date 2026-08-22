comps.login = x => m('.content', [
  m('br'), m('br'),
  m('.level', m('.level-item.has-text-centered',
    m('span.icon.is-large.has-text-primary',
      m('i.fas.fa-8x.fa-motorcycle')
    )
  )), m('br'),
  m('h2.has-text-centered', 'Login'),
  m(autoForm({
    id: 'signin',
    schema: {
      username: {type: String},
      password: {type: String, autoform: {type: 'password'}}
    },
    submit: {value: 'Sign In'},
    action: doc => socket.emit(
      'signin', doc, res => res.username ? [
        localStorage.setItem('userCreds', JSON.stringify(res)),
        mgState = {}, m.redraw(), location.reload()
      ] : alert('Failed, username or password might be wrong')
    ),
    buttons: [
      {label: 'Forgot?', opt: {onclick: x => confirm(
        "You'll be directed to admin help page, go?"
      ) && window.open('https://google.com', '_blank')}}
    ]
  })),

  m('h2.has-text-centered', 'Register'),
  m(autoForm({
    id: 'signup',
    schema: {
      username: {type: String},
      password: {type: String, autoform: {type: 'password'}},
      repeat: {
        type: String, label: 'Repeat password', autoform: {
          type: 'password', help: 'Make sure they are the same'
        }
      }
    },
    submit: {value: 'Sign Up'}, dontClear: true,
    confirmMessage: confirmRegister,

    action: doc => doc.password !== doc.repeat
      ? alert('Unequal password')
      : bcrypt.genSalt(10, (err, salt) => bcrypt.hash(
        doc.password, salt, (err, hash) => socket.emit(
          'signup',
          _.omit({...doc, password: hash}, 'repeat'),
          res => [
            mgState = {}, m.redraw(), alert(({
              0: 'Username has been used',
              1: 'Registration succeed, please login'
            })[res.status])
          ])
        )
      )
  }))
])

comps.driver = x => ({
  0: comps.applyDriver(),
  1: [
    m('h2', {oncreate: updateUser}, 'Status Pengajuan'),
    m('p', 'Pengajuan berhasil, sedang dinilai admin. Mohon tunggu :)')
  ],
  2: [
    m('h2', {oncreate: updateUser}, 'Status Pengajuan'),
    m('p', 'Pengajuan dikembalikan. Keterangan admin: ' + _.get(
      parse(localStorage.userCreds), 'driver.applicant.response'
    )),
    comps.applyDriver()
  ],
  3: gridMaker(driverSubmenu)
})[_.get(
  parse(localStorage.userCreds),
  'driver.applicant.status'
) || 0]

comps.applyDriver = x => [
  m('h2', {
    oncreate: x => socket.emit(
      'getUser', parse(localStorage.userCreds),
      res => [localStorage.setItem(
        'userCreds', JSON.stringify(res)
      ), m.redraw]
    )
  }, 'Pengajuan akun driver'),
  m(autoForm({
    id: 'applyDriver',
    schema: {
      files: {
        type: String, label: 'Folder kelengkapan berkas',
        autoform: {help: 'Link folder Google Drive'}
      },
      note: {
        type: String, label: 'Catatan', optional: true,
        autoform: {
          type: 'textarea',
          placeholder: 'Pesan untuk admin, bebas tapi tetap sopan'
        },
      },
      entry: {
        type: Number, autoform: {type: 'hidden'},
        autoValue: x => Date.now()
      }
    },
    confirmMessage: 'Yakin untuk mengajukan permohonan?',
    submit: {value: 'Ajukan'},
    action: doc => withAs(Object.assign(
      parse(localStorage.userCreds),
      {driver: {applicant: {...doc, status: 1}}},
    ), user => socket.emit(
      'applyDriver', user, res => [
        localStorage.setItem(
          'userCreds', JSON.stringify(user)
        ), m.redraw()
      ]
    ))
  })),
  m('h4', 'Daftar kelengkapan file pengajuan:'),
  m('ol', [
    'Surat permohonan', 'Scan Kartu Tanda Mahasiswa',
    'Scan Kartu SIM', 'Scan lembar STNK', 'Scan KTP',
    'Foto wajah depan, kiri dan kanan sambil pegang KTM'
  ].map(i => m('li', i))),
  m('p', 'Gabungkan semua file dalam 1 folder Google Drive dan copy paste link foldernya ke form di atas. Pastikan akses ke foldernya publik dan tes akses link-nya dari hape yg lain. Mohon lengkapi dulu baru klik Ajukan, untuk mempermudah admin melakukan verifikasi. Perkiraan waktu tunggu 1x24 jam. Setelah status driver approved, semua menu khusus driver otomatis terbuka. Semangat kawan2 :)')
]

const
confirmRegister = 'Dengan ini saya menyatakan bahwa seluruh informasi yang saya berikan adalah benar. Dan saya bertanggungjawab atas aktifitas yang saya lakukan dalam aplikasi ini.',

userMenu = {
  full: 'Akun Pengguna', icon: 'user',
  submenu: {pintu: tern(
    localStorage.getItem('userCreds'),
    {
      full: 'Keluar', icon: 'sign-out',
      comp: x => m('a', {oncreate: x => [
        localStorage.removeItem('userCreds'),
        mgState = {}, m.redraw(), location.reload()
      ]})
    },
    {
      full: 'Masuk/Daftar', icon: 'sign-in',
      comp: comps.login
    }
  )}
},

updateUser = x => socket.emit(
  'getUser', parse(localStorage.userCreds), res => [
    localStorage.setItem('userCreds', stringify(res)),
    m.redraw()
  ]
)