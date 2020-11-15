export default {
    modes: {
        default: {
            policy: 'horizontal',
            panes: [
                {name: 'menubar', fixed: 60},
                {name: 'content', panes: [
                    {name: 'left',   size: '55%', widgets: [{alias: 'blockly', label: 'Blockly'}], title: 'Blockly'},
                    {name: 'center', size: '35%', widgets: [{alias: 'board', label: 'Board'}], title: 'Board'},
                    {name: 'right',  size: '20%', panes: [
                        {name: 'rtop', widgets: []},
                        {name: 'rcenter', widgets: []},
                        {name: 'rbottom', widgets: []},
                    ]}
                ]},
            ]
        },
        coding: {
            policy: 'horizontal',
            panes: [
                {name: 'menubar', fixed: 60},
                {name: 'content', panes: [
                    {name: 'left',  size: '80%', widgets: [{alias: 'blockly', label: 'Blockly'}], title: 'Blockly'},
                    {name: 'right', size_min: '10%', size: '20%', panes: [
                        {name: 'rtop', widgets: []},
                        {name: 'rcenter', widgets: []},
                        {name: 'rbottom', widgets: []},
                    ]}
                ]},
            ]
        },
        courses: {
            policy: 'horizontal',
            panes: [
                {name: 'menubar', fixed: 60},
                {name: 'content'}
            ]
        },
    }
}