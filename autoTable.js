/*global _ m saveAs withAs*/

var atState = {},
ors = array => array.find(Boolean),
ands = array => array.reduce((a, b) => a && b, true),
withAs = (obj, cb) => cb(obj),
ifit = (obj, cb) => Boolean(obj) && cb(obj),
timestamp = str => +(new Date(str)),
modify = (rows, opts) => rows

  // if timeRange is available
  .filter(i => withAs(
    {
      start: _.get(atState, [opts.id, 'start_range']),
      end: _.get(atState, [opts.id, 'end_range']),
      func: eval(_.get(atState, [opts.id, 'rangeFunc']))
    }, ({start, end, func}) => ands([
      start, end, timestamp(start) < timestamp(end)
    ]) ? func(i, timestamp(start), timestamp(end)) : i
  ))

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

  // timeRange filtering, if filled
  opts.timeRange && m('.columns',
    m('.column',
        m('label.label', 'Criteria'),
        m('.select.is-fullwidth', m('select',
        {
          value: _.get(atState, [opts.id, 'rangeFunc']),
          onchange: e => _.merge(atState, {[opts.id]: {
            rangeFunc: e.target.value
          }})
        },
        [
          m('option', {value: 0}, '-'),
          ..._.map(opts.timeRange, (func, label) => m('option',
            {value: func}, label
          ))
        ]
      ))
    ),
    ['start_range', 'end_range'].map(i => m('.column',
      m('label.label', _.startCase(i)),
      m('.control', m('input.input', {
        type: 'datetime-local',
        name: i, value: _.get(atState, [opts.id, i]),
        onchange: e => _.merge(atState, {[opts.id]: {
          [i]: e.target.value
        }})
      }))
    ))
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

    ...(opts.buttons || []).map(i => i && m('.control',
      m('.button', i.opt, i.label)
    )),

    // export table contents to csv
    opts.export && m('.control', m('.button.is-link', {
      onclick: e => saveAs(
        new Blob(
          [[modify(opts.rows, opts).map(
            i => _.values(i.row).join(';')
          ).join('\n')]], 
          {type: 'text/csv;charset=utf-8;'}
        ), opts.export() + '.csv'
      )
    }, 'Export CSV')),

    ors(['filters', 'start_range', 'end_range', 'rangeFunc'].map(
      i => _.get(atState, [opts.id, i])
    )) && m('.button.is-warning', {
      onclick: e => [
        ['filters', 'start_range', 'end_range', 'rangeFunc'].map(
          i => delete atState[opts.id][i]
        ),
        m.redraw()
      ]
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
      m('div',
        m('span', ifit(
          _.get(opts, ['tooltip', j]),
          tip => ({
            class: 'has-tooltip-bottom',
            'data-tooltip': tip
          })
        ), i),
        m('span.icon',
          j === _.get(atState, [opts.id, 'sortBy']) ?
            m('i.fas.fa-angle-' + (
              _.get(atState, [opts.id, 'sortWay']) ?
              'up': 'down'
            ))
          : m('i.fas.fa-sort')
        )
      )
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
