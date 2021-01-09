export default {
    options: {
        show_headers: true,
    },
    modes: {
        default: {
            policy: 'vertical',
            panes: [
                {
                    name: 'blockly', size: '70%',
                    composer: 'overlay',
                    widgets: [{alias: 'blockly', label: 'Программа'}, {alias: 'launcher', label: 'Панель запуска'}]
                },
                {
                    name: 'board', size: '30%',
                    widgets: [{alias: 'board', label: 'Доска'}]
                }
            ]
        }
    }
}