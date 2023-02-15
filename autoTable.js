/*global _ m saveAs*/

var atState = {},
ors = array => array.find(Boolean),
ands = array => array.reduce((a, b) => a && b, true),
ifit = (obj, cb) => obj && cb(obj),
modify = (rows, opts) => rows

  // if filters are available
  .filter(i => ands(_.map(
    _.get(atState, [opts.id, 'filters']),
    (val, key) => opts.filters[key].find(j => j.label === val)
  ).map(j => j.func(i.data))))

  // if search box is available
  .filter(i =>
    _.values(i.row).map(_.lowerCase)
    .join('').includes(_.get(atState, [opts.id, 'search']) || '')
  )

  // if sorting is required
  .sort((a, b) => _.get(atState, [opts.id, 'sortBy']) &&
    _[_.get(atState, [opts.id, 'sortWay']) ? 'gt' : 'lt'](
      a.row[_.get(atState, [opts.id, 'sortBy'])],
      b.row[_.get(atState, [opts.id, 'sortBy'])]
    ) ? -1 : 1
  )

  // if slicing is required
  .slice(
    (_.get(atState, [opts.id, 'activeStep']) || 0) *
    (_.get(atState, [opts.id, 'pagination']) || 0),
    ((_.get(atState, [opts.id, 'activeStep']) || 0) *
    (_.get(atState, [opts.id, 'pagination']) || 0)) +
    ors([_.get(atState, [opts.id, 'activeStep']),
    _.get(opts, ['showSteps', 0]), opts.rows.length])
  ),

autoTable = opts => ({view: () => m('.box',

  m('.columns',

    // search term box
    opts.search && m('.column.is-10', m('form',
      {onsubmit: e => [
        e.preventDefault(),
        _.assign(atState, {[opts.id]: {
          search: _.lowerCase(e.target[0].value)
        }}),
        m.redraw()
      ]},
      m('.control.is-expanded', m('input.input.is-fullwidth', {
        type: 'text', placeholder: 'Search data',
      }))
    )),

    // pagination steps
    opts.showSteps && m('.column.is-2',
      m('.select.is-fullwidth', m('select',
        {onchange: e => [
          _.assign(atState, {[opts.id]: _.merge(
            _.get(atState, opts.id),
            {activeStep: +e.target.value, pagination: 0}
          )})
        ], value: _.get(atState, [opts.id, 'activeStep'])},
        opts.showSteps.map(i => m('option', {value: i}, 'Show '+i))
      ))
    )
  ),

  // filters selection, if available
  opts.filters && m('.columns',
    _.map(opts.filters, (val, key) => m('.column', m('.field',
      m('label.label', key),
      m('.select.is-fullwidth', m('select',
        {
          onchange: e => _.assign(atState, {[opts.id]: _.merge(
            _.get(atState, opts.id), {filters: _.merge(
              _.get(atState, [opts.id, 'filters']) || {},
              {[key]: e.target.value}
            )}
          )}),
          value: _.values(_.get(atState, [opts.id, 'filters']) || {})
          .find(i => val.map(j => j.label).includes(i))
        },
        val.map(i => m('option', {value: i.label}, i.label))
      ))
    ))),
  ),

  // additional functions icons
  m('.field.is-grouped', [

    ...(opts.buttons || []).map(i => m('.control',
      m('.button', i.opt, i.label)
    )),

    // export table contents to csv
    opts.export && m('.control', m('.button.is-link', {
      onclick: e => saveAs(
        new Blob([
          [modify(opts.rows, opts).map(i => _.values(i.row).join(';')+';\n')],
          {type: 'text/csv;charset=utf-8'}
        ]), opts.export() + '.csv'
      )
    }, 'Export CSV')),

    _.get(atState, [opts.id, 'filters']) && m('.button.is-warning', {
      onclick: e => [(delete atState[opts.id].filters), m.redraw()]
    }, 'Reset Filters'),
  ]),

  // table contents
  m('.table-container', m('table.table',

    // sortable by column
    m('thead', m('tr', _.map(opts.heads, (i, j) => m('th',
      {onclick: () => [
        _.assign(atState, {[opts.id]: _.merge(
          _.get(atState, opts.id),
          {sortBy: j, sortWay: !_.get(atState, [opts.id, 'sortWay'])}
        )}),
        m.redraw()
      ]},
      // and its direction
      m('div', m('span', i), m('span.icon',
        j === _.get(atState, [opts.id, 'sortBy']) ?
          m('i.fas.fa-angle-' + (
            _.get(atState, [opts.id, 'sortWay']) ?
            'up': 'down'
          ))
        : m('i.fas.fa-sort')
      ))
    )))),

    // rows contents
    m('tbody',
      modify(opts.rows, opts).map(i => m('tr',
        {onclick: () => opts.onclick(i.data)},
        _.map(opts.heads, (val, key) => m('td', i.row[key]))
      ))
    )
  )),

  // pagination indicators
  m('nav.pagination', m('.pagination-list',
    _.range(
      opts.rows.length / ors([
        _.get(atState, [opts.id, 'activeStep']),
        _.get(opts, ['showSteps', 0])
      ])
    ).map(i => m('div', m('a.pagination-link', {
      class: _.get(atState, [opts.id, 'pagination']) === i && 'is-current',
      onclick: () => [
        _.assign(atState, {[opts.id]: _.merge(
          _.get(atState, opts.id), {
            pagination: i, search: null,
            activeStep: ors([
              _.get(atState, [opts.id, 'activeStep']),
              opts.showSteps[0]
            ])
          }
        )}),
        m.redraw()
      ]
    }, i + 1)))
  ))
)})
