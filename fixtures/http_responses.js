module.exports = [
    {
        path: 'distros/latest',
        params: {
            method: 'get',
        },
        response_data: {
            "file": "google.com", 
            "arch": "win64", 
            "version": "0.0.0", 
            "is_prerelease": false
        }
    },
    {
        path: 'courses',
        params: {
            method: 'get',
        },
        response_data: [
            {
                "model": "courses.course",
                "pk": 3,
                "fields": {
                    "name": "elec course",
                    "description": "desc",
                    "hidden": false,
                    "order_num": 2
                },
                "lessons": [
                    {
                        "model": "courses.lesson",
                        "pk": 9,
                        "fields": {
                            "name": "elec lesson",
                            "description": "desc",
                            "language": "en",
                            "order_num": null
                        }
                    }
                ]
            }
        ]
    },
    {
        path: 'courses/lesson/9/',
        params: {
            method: 'get',
        },
        response_data: {
            "model": "courses.lesson",
            "pk": 9,
            "name": "elec lesson",
            "description": "desc",
            "order_num": null,
            "missions": [
                {
                    "model": "courses.mission",
                    "pk": 83,
                    "name": "elec mission",
                    "category": 1,
                    "exercises": [
                        {
                            "model": "courses.exercise",
                            "pk": 221,
                            "mission": 83,
                            "name": "elec exercise 1",
                            "task_description": "desc",
                            "task_description_alt": "desc",
                            "message_success": "",
                            "type": 0,
                            "is_sandbox": false,
                            "board_editable": true,
                            "show_code_for_arduino": true,
                            "check_type": 1,
                            "check_type_board": 1,
                            "buttons_model": "",
                            "block_types": "",
                            "max_blocks": 0,
                            "launch_variant": 0,
                            "display_buttons": false,
                            "display_codenet": false,
                            "hidden": false,
                            "order_num": 0,
                            "popovers": [],
                            "variables": []
                        }
                    ]
                },
                {
                    "model": "courses.mission",
                    "pk": 84,
                    "name": "elec mission 2",
                    "category": 0,
                    "exercises": [
                        {
                            "model": "courses.exercise",
                            "pk": 222,
                            "mission": 84,
                            "name": "elec exercise 2",
                            "task_description": "",
                            "task_description_alt": "",
                            "message_success": "",
                            "type": 0,
                            "is_sandbox": false,
                            "board_editable": true,
                            "show_code_for_arduino": true,
                            "check_type": 1,
                            "check_type_board": 1,
                            "buttons_model": "",
                            "block_types": "",
                            "max_blocks": 0,
                            "launch_variant": 0,
                            "display_buttons": false,
                            "display_codenet": false,
                            "hidden": false,
                            "order_num": 0,
                            "popovers": [],
                            "variables": []
                        }
                    ]
                },
            ]
        }
    }
]