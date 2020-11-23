var m, _, atState = {},
withThis = (obj, cb) => cb(obj),
ands = array => array.reduce((a, b) => a && b, true),

autoTable = obj => ({view: () => m('.box',
  m('.columns',
    m('.column.is-10', m('form',
      {onsubmit: e => [
        e.preventDefault(),
        _.assign(atState, {[obj.id]: {
          search: e.target[0].value
        }}),
        m.redraw()
      ]},
      m('.control.is-expanded', m('input.input.is-fullwidth', {
        type: 'text', placeholder: 'Search data',
      }))
    )),
    obj.showSteps && m('.column.is-2',
      m('.select.is-fullwidth', m('select',
        {onchange: e => [
          _.assign(atState, {[obj.id]: _.merge(
            _.get(atState, obj.id),
            {activeStep: e.target.value}
          )})
        ],value: _.get(atState, [obj.id, 'activeStep'])},
        obj.showSteps.map(i => m('option', {value: i}, 'Show '+i))
      ))
    )
  ),
  m('.table-container', m('table.table',
    m('thead', m('tr', _.map(obj.heads, (i, j) => m('th',
      {onclick: () => [
        _.assign(atState, {[obj.id]: _.merge(
          _.get(atState, obj.id),
          {sortBy: j, sortWay: !_.get(atState, [obj.id, 'sortWay'])}
        )}),
        m.redraw()
      ]},
      m('div', m('span', i), m('span.icon',
        j === _.get(atState, [obj.id, 'sortBy'])? m('i.fas.fa-angle-'+(
          _.get(atState, [obj.id, 'sortWay']) ? 'up': 'down'
        )) : m('i.fas.fa-sort')
      ))
    )))),
    m('tbody',
      obj.rows.filter(
        i => _.values(i.row).join('').includes(
          _.get(atState, [obj.id, 'search']) || ''
        )
      ).sort((a, b) => _.get(atState, [obj.id, 'sortBy']) &&
        _[_.get(atState, [obj.id, 'sortWay']) ? 'gt' : 'lt'](
          a.row[_.get(atState, [obj.id, 'sortBy'])],
          b.row[_.get(atState, [obj.id, 'sortBy'])]
        ) ? -1 : 1
      ).slice(
        (+(_.get(atState, [obj.id, 'activeStep']) || 0) * +(_.get(atState, [obj.id, 'pagination']) || 0)),
        ((
          +(_.get(atState, [obj.id, 'activeStep']) || 0) *
          +(_.get(atState, [obj.id, 'pagination']) || 0)
        ) + +(_.get(atState, [obj.id, 'activeStep']) || obj.rows.length))
      ).map(i => m('tr',
        {onclick: () => obj.onclick(i.data)},
        _.values(i.row).map(j => m('td', j))
      ))
    )
  )),
  m('nav.pagination', m('.pagination-list',
    _.range(
      obj.rows.length / _.get(atState, [obj.id, 'activeStep'])
    ).map(i => m('div', m('a.pagination-link', {
      class: _.get(atState, [obj.id, 'pagination']) === i && 'is-current',
      onclick: () => [
        _.assign(atState, {[obj.id]: _.merge(
          _.get(atState, obj.id), {pagination: i, search: null}
        )}),
        m.redraw()
      ]
    }, i+1)))
  ))
)})
