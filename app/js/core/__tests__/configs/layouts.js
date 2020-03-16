export default {
    default: {
        policy: 'horizontal',
        panes: [
            {name: 'p1', fixed: 100, panes: [{name: 's1'}]},
            {name: 'p2', panes: [
                {name: 's1', size: '20%'},
                {name: 's2'},
                {name: 's3', size: '20%'}
            ]},
        ]
    },
    def2: {
        policy: 'horizontal',
        panes: [
            {name: 'p1', fixed: 100, panes: [{name: 's1'}]},
            {name: 'p2', panes: [
                {name: 's1', size: '40%'},
                {name: 's2'},
            ]},
        ]
    }
}