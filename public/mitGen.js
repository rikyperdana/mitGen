/*global Chart*/

var m, _, mgState = {}, comps = {}, state = {},
withAs = (opts, cb) => cb(opts),
ifit = (opts, cb) => Boolean(opts) && cb(opts),
ands = array => array.reduce((a, b) => a && b, true),
makeArray = n => [...Array(n).keys()],
makeIconLabel = (icon, label) => [
  icon && m('span.icon', m('i.fas.fa-'+icon)),
  m('span', label)
],

poster = (url, body, cb) => fetch(url, {
  headers: {'Content-Type': 'application/json'},
  method: 'post', body: JSON.stringify(body)
}).then(res => res.json()).then(cb),

mitGen = opts => ({view: () => m('div',
  {class: 'has-background-light'},
  opts.theme && m('link', {
    rel: 'stylesheet',
    href: `https://unpkg.com/bulmaswatch/${opts.theme}/bulmaswatch.min.css`
  }),
  m('nav.navbar.is-primary.is-fixed-top',
    m('.navbar-brand',
      m('a.navbar-item',
        {onclick: () => [
          _.assign(mgState, {comp: undefined}),
          m.redraw()
        ]},
        opts.brand.full || opts.brand.name
      ),
      m('.navbar-burger',
        {
          role: 'button', class: mgState.burgerMenu && 'is-active',
          onclick: () => mgState.burgerMenu = !mgState.burgerMenu
        },
        _.range(3).map(i => m('span', {'aria-hidden': true}))
      )
    ),
    m('.navbar-menu',
      {class: mgState.burgerMenu && 'is-active'},
      m('.navbar-start', _.map(opts.start, (val, key) =>
        m('a.navbar-item',
          {
            class: val.submenu && 'has-dropdown is-hoverable',
            onclick: () => [
              _.assign(mgState, {comp: val.comp, burgerMenu: null}),
              m.redraw()
            ]
          },
          val.submenu ? [
            m('a.navbar-link', val.full || _.startCase(key)),
            m('.navbar-dropdown', _.map(val.submenu, (i, j) =>
              m('a.navbar-item',
                {onclick: e => [
                  e.stopPropagation(),
                  _.assign(mgState, {comp: i.comp, burgerMenu: null}),
                  m.redraw()
                ]},
                makeIconLabel(i.icon, i.full || _.startCase(j))
              )
            ))
          ] : m('span', val.full || _.startCase(key))
        )
      )),
      opts.end &&
      m('.navbar-end', m('.navbar-item.has-dropdown.is-hoverable',
        m('a.navbar-link',
          {onclick: () => [
            (mgState.burgerMenu = !mgState.burgerMenu),
            _.assign(mgState, {comp: opts.end.comp}),
            m.redraw()
          ]},
          opts.end.full
        ),
        m('.navbar-dropdown.is-right',
          opts.end.submenu && _.map(opts.end.submenu, (i, j) =>
            m('a.navbar-item',
              {onclick: () => [
                (mgState.burgerMenu = !mgState.burgerMenu),
                _.assign(mgState, {comp: i.comp}),
                m.redraw()
              ]},
              makeIconLabel(i.icon, i.full || _.startCase(j))
            )
          )
        )
      ))
    )
  ),
  m('section.section', m('.container',
    {style: 'min-height:100vh'},
    withAs(
      [
        m('.content', mgState.comp ? mgState.comp() : [
          opts.above,
          m('h1', 'Dashboard'),
          _.chunk(_.map(opts.start, (v, k) => [v, k]), 3).map(i =>
            m('.columns', i.map(j => m('.column',
              m('a.box', m('article.media',
                {onclick: () => [
                  _.assign(mgState, {comp: j[0].comp}),
                  m.redraw()
                ]},
                m('.media-left', m('span.icon.has-text-primary',
                  m('i.fas.fa-2x.fa-'+j[0].icon))
                ),
                m('.media-content', m('.content',
                  m('h3', j[0].full || _.startCase(j[1]))
                ))
              ))
            )))
          ),
          opts.below
        ])
      ],
      body => opts.login ? (
        opts.loginState ? body : opts.login()
      ) : body
    )
  ))
)})
