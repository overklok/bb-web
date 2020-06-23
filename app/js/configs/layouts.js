export default {
    default: {
        policy: 'horizontal',
        panes: [
            {name: 'p1', fixed: 60, panes: [{name: 's1'}]},
            {name: 'p2', panes: [
                {name: 's1', size: '20%', views: [{alias: 'blockly', label: "Blockly"}], title: 'Blockly'},
                {name: 's2', size_min: '10px', views: [{alias: 'board', label: "Board"}, {alias: 'board', label: "Label2"}], title: 'Breadboard'},
                {name: 's3', size: '20%', panes: [
                        {name: 'k1', views: [{alias: 'board', label: "Board 2"}]},
                        {name: 'k2', views: [{alias: 'board', label: "Board 3"}]},
                        {name: 'k3', views: [{alias: 'board', label: "Board 4"}]},
                ]}
            ]},
        ]
    },
    default2: {
        policy: 'horizontal',
        panes: [
            {name: 'p2', panes: [
                {name: 's1', size: '20%', views: [{alias: 'blockly', label: "Blockly"}], title: 'Blockly'},
                // {name: 's2', size_min: '10px', views: [{alias: 'board', label: "Board"}, {alias: 'board', label: "Label2"}], title: 'Breadboard'},
                {name: 's3', size: '20%', panes: [
                        {name: 'k3', views: [{alias: 'board', label: "Board 4"}]},
                ]}
            ]},
        ]
    },
}