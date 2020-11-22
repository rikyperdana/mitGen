var m, _, atState = {},
withThis = (obj, cb) => cb(obj),
ands = array => array.reduce((a, b) => a && b, true),

autoTable = obj => ({view: () => m('.box',
  m('.columns',
    m('.column.is-10',
      m('form',
        {onsubmit: e => [
          e.preventDefault(),
          _.assign(atState, {search: e.target[0].value}),
          m.redraw()
        ]},
        m('.control.is-expanded', m('input.input.is-fullwidth', {
          type: 'text', placeholder: 'Search data',
        }))
      )
    ),
    obj.showSteps && m('.column.is-2',
      m('.select.is-fullwidth', m('select',
        {onchange: e => [
          _.assign(atState, {activeStep: e.target.value})
        ],value: atState.activeStep},
        obj.showSteps.map(i => m('option', {value: i}, 'Show '+i))
      ))
    )
  ),
  m('.table-container', m('table.table',
    m('thead', m('tr', _.map(obj.heads, (i, j) => m('th',
      {onclick: () => [
        _.assign(atState, {sortBy: j, sortWay: !atState.sortWay}),
        m.redraw()
      ]},
      m('div', m('span', i), m('span.icon',
        j === atState.sortBy ? m('i.fas.fa-angle-'+(
          atState.sortWay ? 'up': 'down'
        )) : m('i.fas.fa-sort')
      ))
    )))),
    m('tbody',
      obj.rows.filter(
        i => _.values(i.row).join('').includes(
          atState.search || ''
        )
      ).sort((a, b) => atState.sortBy &&
        _[atState.sortWay ? 'gt' : 'lt'](
          a.row[atState.sortBy], b.row[atState.sortBy]
        ) ? -1 : 1
      ).slice(
        0, +atState.activeStep || obj.rows.length
      ).map(i => m('tr',
        {onclick: () => obj.onclick(i.data)},
        _.values(i.row).map(j => m('td', j))
      ))
    )
  ))
)})

/*
TODO:
1. Rows limit
2. Pagination
3. Search
*/
