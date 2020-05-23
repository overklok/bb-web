export default {
    default: {
        policy: 'horizontal',
        panes: [
            {name: 'p1', fixed: 100, panes: [{name: 's1'}]},
            {name: 'p2', panes: [
                {name: 's1', size: '20%'},
                {name: 's2', size_min: '10px'},
                {name: 's3', size: '20%', panes: [
                        {name: 'k1', view_aliases: ['test1']},
                        {name: 'k2'},
                        {name: 'k3'},
                ]}
            ]},
        ]
    },
    default2: {
        policy: 'horizontal',
        panes: [
            {name: 'p1', fixed: 100, panes: [{name: 's1'}]},
            {name: 'p2', panes: [
                {name: 's1', size: '20%'},
                {name: 's2', size_min: '10px'},
                {name: 's3', size: '20%', panes: [
                        {name: 'k1'},
                        {name: 'k2', view_aliases: ['test1']},
                        {name: 'k3'},
                ]}
            ]},
        ]
    },
    def2: {
        policy: 'horizontal',
        panes: [
            {name: 'p1', fixed: 80, panes: [{name: 's1'}]},
            {name: 'p2', panes: [
                {name: 's1', size: '40%'},
                {name: 's2', view_aliases: ['test1']},
            ]},
        ]
    },
    def3: {
        policy: 'horizontal',
        panes: [
            {name: 'p1', fixed: 80, panes: [{name: 's1'}]},
            {name: 'p2', panes: [
                {name: 's1', size: '40%'},
                {name: 's3', panes: [
                        {name: 'k1'},
                        {name: 'k3'},
                ]}
            ]},
        ]
    }
}