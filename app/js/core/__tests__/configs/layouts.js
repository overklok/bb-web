export default {
    default: {
        policy: 'horizontal',
        panes: [
            {name: 'p1', panes: [{name: 's1'}]},
            {name: 'p2', panes: [{name: 's1', size: 20}, {name: 's2'}]},
            {name: 'p3', panes: [{name: 's1', fixed: 100}, {name: 's2'}, {name: 's1'}]},
            {name: 'p3', panes: [{name: 's1'}, {name: 's2'}, {name: 's1'}, {name: 's2'}]},
            {name: 'p3', panes: [{name: 's1'}, {name: 's2'}, {name: 's1'}, {name: 's2'}, {name: 's1'}]},
            {name: 'p3', panes: [{name: 's1'}, {name: 's2'}, {name: 's1'}, {name: 's2'}, {name: 's1'}, {name: 's2'}]},
            {name: 'p3', panes: [{name: 's1', resizable: false}, {name: 's2'}, {name: 's1'}, {name: 's2'}, {name: 's1'}, {name: 's2'}, {name: 's1'}]},
            {name: 'p3', panes: [{name: 's1'}, {name: 's2'}, {name: 's1'}, {name: 's2'}, {name: 's1'}, {name: 's2'}, {name: 's1'}, {name: 's2'}]},
            {name: 'p3', panes: [{name: 's1'}, {name: 's2'}, {name: 's1'}, {name: 's2'}, {name: 's1'}, {name: 's2'}, {name: 's1'}, {name: 's2'}, {name: 's2'}]},
        ]
    }
}