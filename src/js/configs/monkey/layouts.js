export default {
    options: {
        show_headers: true,
    },
    modes: {
        default: {
            policy: 'vertical',
            panes: [
                {
                    name: 'board-left', resizable: false,
                    widgets: [{alias: 'board_disp', label: 'Сборочная доска'}]
                },
                {
                    name: 'board-right',
                    widgets: [{alias: 'board_ref', label: 'Эталонная доска'}]
                },
                {
                    name: 'settings', fixed: '350px',
                    panes: [
                        {name: 'Управление', fixed: '150px', widgets: [{alias: 'controls', label: 'Управление'}]},
                        {name: 'Журнал', widgets: [{alias: 'log', label: 'Журнал'}]},
                    ]
                },
            ]
        }
    }
}