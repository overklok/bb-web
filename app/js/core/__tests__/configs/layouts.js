export default {
    default: {
        policy: 'horizontal',
        panes: [
            {name: 'head', size: '60px', size_min: '60px', size_max: '60px'},
            {name: 'body', panes: [
                {name: 's1', size: 35},
                {name: 's2'},
                {name: 's3', size: 30, panes: [
                    {name: 'p1', size: 33},
                    {name: 'p2', size: 33},
                    {name: 'p3'},
                ]},
            ]},
        ]
    },
    test: {
        policy: 'horizontal',
        panes: [
            {name: 'p1', panes: [{name: 's1'}]},
            {name: 'p2', panes: [{name: 's1', size_min: '10px', size_max: '50px'}, {name: 's2', size: 0}]},
            {name: 'p3', panes: [{name: 's1', size: 20}, {name: 's2'}, {name: 's1'}]},
            {name: 'p3', panes: [{name: 's1', size: 20}, {name: 's2'}, {name: 's1'}, {name: 's2'}]},
            {name: 'p3', panes: [{name: 's1', size: 20}, {name: 's2'}, {name: 's1'}, {name: 's2'}, {name: 's1'}]},
            {name: 'p3', panes: [{name: 's1', size: 20}, {name: 's2'}, {name: 's1'}, {name: 's2'}, {name: 's1'}, {name: 's2'}]},
            {name: 'p3', panes: [{name: 's1', size: 20}, {name: 's2'}, {name: 's1'}, {name: 's2'}, {name: 's1'}, {name: 's2'}, {name: 's1'}]},
            {name: 'p3', panes: [{name: 's1', size: 20}, {name: 's2'}, {name: 's1'}, {name: 's2'}, {name: 's1'}, {name: 's2'}, {name: 's1'}, {name: 's2'}]},
            {name: 'p3', panes: [{name: 's1', size: 20}, {name: 's2'}, {name: 's1'}, {name: 's2'}, {name: 's1'}, {name: 's2'}, {name: 's1'}, {name: 's2'}, {name: 's2'}]},
        ]
    }
}