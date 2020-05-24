export default {
    default: {
        policy: 'horizontal',
        panes: [
            {name: 'p1', fixed: 100, panes: [{name: 's1'}]},
            {name: 'p2', panes: [
                {name: 's1', size: '20%'},
                {name: 's2', size_min: '10px'},
                {name: 's3', size: '20%', panes: [
                        {name: 'k1', views: [{alias: 'test1', label: "Label1"}, {alias: 'test2', label: "Label2"}]},
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
                        {name: 'k2', views: [{alias: 'test1'}]},
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
    },
    horz: {
        policy: 'horizontal',
        panes: [
            {name: 'p1'},
            {name: 'p2'},
            {name: 'p3'},
        ]
    },
    vert: {
        policy: 'vertical',
        panes: [
            {name: 's1'},
            {name: 's2'},
            {name: 's3'},
        ]
    }
}