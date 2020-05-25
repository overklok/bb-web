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
                        {name: 'k2', views: [{alias: 'test1', label: "SingleTest1"}]},
                        {name: 'k3'},
                ]}
            ]},
        ]
    },
}