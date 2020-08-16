export default {
    modes: {
        default: {
            policy: 'horizontal',
            panes: [
                {name: 'p1', fixed: 60, panes: [{name: 's1'}]},
                {name: 'p2', panes: [
                    {name: 's1', size: '20%', widgets: [
                        {alias: 'blockly', label: "Blockly"}
                        ], title: 'Blockly'},
                    {name: 's2', size_min: '10px', widgets: [
                        {alias: 'board', label: "Board"},
                        {alias: 'board', label: "Label2"},
                        {alias: 'blockly', label: "Blockly Tabbed"},
                    ], title: 'Central Workspace'},
                    {name: 's3', size: '20%', panes: [
                            {name: 'k1', widgets: []},
                            {name: 'k2', widgets: []},
                            {name: 'k3', widgets: []},
                    ]}
                ]},
            ]
        },
        default2: {
            policy: 'horizontal',
            panes: [
                {name: 'p2', panes: [
                    {name: 's1', size: '20%', widgets: [], title: 'Blockly'},
                    {name: 's2', size_min: '10px', views: [], title: 'Breadboard'},
                    {name: 's3', size: '20%', panes: [
                            {name: 'k3', widgets: []},
                    ]}
                ]},
            ]
        },
    }
}