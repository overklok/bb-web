export default {
    options: {
        show_headers: false,
    },
    modes: {
        index: {
            policy: 'horizontal',
            panes: [
                {name: 'content', widgets: [{alias: 'courses', label: 'Courses'}]}
            ]
        },
        full: {
            policy: 'horizontal',
            panes: [
                {name: 'menubar', fixed: 55, widgets: [{alias: 'navbar', label: ''}]},
                {name: 'content', panes: [
                    {
                        name: 'left',
                        size: '55%',
                        widgets: [
                            {alias: 'blockly', label: 'Blockly'},
                            {alias: 'launcher', label: 'Launcher'}
                        ],
                        composer: 'overlay',
                        title: 'Blockly'
                    },
                    {
                        name: 'center',
                        size: '35%',
                        widgets: [{alias: 'board', label: 'Board'}],
                        title: 'Board'
                    },
                    {
                        name: 'right',
                        size: '20%', panes: [
                            {name: 'rtop', widgets: [{alias: 'task', label: 'Task'}]},
                            {name: 'rcenter', widgets: []},
                            {name: 'rbottom', widgets: []},
                        ]
                    }
                ]},
            ]
        },
        code: {
            policy: 'horizontal',
            panes: [
                {name: 'menubar', fixed: 55, widgets: [{alias: 'navbar', label: ''}]},
                {name: 'content', panes: [
                    {
                        name: 'left',
                        size: '70%',
                        widgets: [
                            {alias: 'blockly', label: 'Blockly'},
                            {alias: 'launcher', label: 'Launcher'}
                        ],
                        composer: 'overlay',
                        title: 'Blockly'
                    },
                    {
                        name: 'right',
                        size_min: '10%',
                        size: '30%',
                        size_max: '600px',
                        panes: [
                            {name: 'rtop', widgets: [{alias: 'task', label: 'Task'}]},
                            {name: 'rcenter', widgets: []
                        },
                    ]}
                ]},
            ]
        },
        board: {
            policy: 'horizontal',
            panes: [
                {
                    name: 'menubar',
                    fixed: 55,
                    widgets: [{alias: 'navbar', label: ''}]
                },
                {name: 'content', panes: [
                    {
                        name: 'left',
                        size: '35%',
                        widgets: [
                            {alias: 'board', label: 'Board'},
                            {alias: 'launcher', label: 'Launcher'}
                        ],
                        composer: 'overlay',
                        title: 'Board'
                    },
                    {
                        name: 'right',
                        size_min: '10%',
                        size: '20%',
                        panes: [
                            {name: 'rtop', widgets: [{alias: 'task', label: 'Task'}]
                        },
                    ]}
                ]},
            ]
        },
        courses: {
            policy: 'horizontal',
            panes: [
                {name: 'menubar', fixed: 55, widgets: [{alias: 'navbar', label: ''}]},
                {name: 'content'}
            ]
        },
    }
}