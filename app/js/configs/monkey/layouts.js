export default {
    modes: {
        default: {
            policy: 'vertical',
            panes: [
                {
                    name: 'board-left', resizable: false,
                    widgets: [{alias: 'board_disp', label: 'Display board'}]
                },
                {
                    name: 'board-right',
                    widgets: [{alias: 'board_ref', label: 'Reference board'}]
                },
                {
                    name: 'settings', fixed: '20%',
                    panes: [
                        {name: 'controls', fixed: '10%'},
                        {name: 'list'},
                    ]
                },
            ]
        }
    }
}