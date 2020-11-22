var m, _, atState = {},
withThis = (obj, cb) => cb(obj),

autoTable = obj => ({view: () => m('.box', m('.table-container', m('table.table',
  m('thead', m('tr', _.map(obj.heads, (i, j) => m('th',
    {onclick: () => [
      _.assign(atState, {sortBy: j, sortWay: !atState.sortWay}),
      m.redraw()
    ]},
    m('div', m('span', i), m('span.icon',
      j === atState.sortBy && m('i.fas.fa-angle-'+(
        atState.sortWay ? 'up': 'down'
      ))
    ))
  )))),
  m('tbody',
    obj.rows.sort((a, b) => atState.sortBy &&
      _[atState.sortWay ? 'gt' : 'lt'](
        a.row[atState.sortBy], b.row[atState.sortBy]
      ) ? -1 : 1
    ).map(i => m('tr',
      {onclick: () => obj.onclick(i.data)},
      _.values(i.row).map(j => m('td', j))
    ))
  )
)))})
