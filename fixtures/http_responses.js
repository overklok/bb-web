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
                    },
                    {
                        "model": "courses.lesson",
                        "pk": 10,
                        "fields": {
                            "name": "arduino lesson",
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
                            "message_success": "",
                            "type": 0,
                            "is_sandbox": true,
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
                            "message_success": "",
                            "type": 0,
                            "is_sandbox": true,
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
    },
    {
        path: 'courses/lesson/10/',
        params: {
            method: 'get',
        },
        response_data: {
            "model": "courses.lesson",
            "pk": 10,
            "name": "arduino lesson",
            "description": "desc",
            "order_num": null,
            "missions": [
                {
                    "model": "courses.mission",
                    "pk": 183,
                    "name": "elec mission",
                    "category": 1,
                    "exercises": [
                        {
                            "model": "courses.exercise",
                            "pk": 1221,
                            "mission": 183,
                            "name": "elec exercise 1",
                            "task_description": "desc \\(U_{вых} = НЕ(U_{вх2})\\)",
                            "message_success": "",
                            "type": 0,
                            "is_sandbox": true,
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
                    "pk": 184,
                    "name": "arduino mission 2",
                    "category": 0,
                    "exercises": [
                        {
                            "model": "courses.exercise",
                            "pk": 1222,
                            "mission": 184,
                            "name": "arduino exercise 2",
                            "task_description": "\\(U_{вых} = НЕ(U_{вх2}) = НЕ( НЕ(U_{вх}) ) = U_{вх}\\)",
                            "message_success": "",
                            "type": 3,
                            "is_sandbox": true,
                            "board_editable": true,
                            "show_code_for_arduino": true,
                            "check_type": 1,
                            "check_type_board": 1,
                            "buttons_model": "",
                            "block_types": {
                                "logic_neg": 0,
                                "logic_and": 0,
                                "controls_wait_seconds": 0,
                                "math_mul": 0,
                                "math_number_pwm": 0,
                                "logic_or": 0,
                                "math_add": 0,
                                "logic_eq": 0,
                                "dummy_1": 0,
                                "event_key": 0,
                                "controls_repeat_ext": 0,
                                "math_sub": 0,
                                "logic_le": 0,
                                "dummy_2": 0,
                                "logic_ge": 0,
                                "math_div": 0,
                                "event_key_onpush_number": 0,
                                "event_key_onpush_letter": 0,
                                "logic_lt": 0,
                                "math_mod": 0,
                                "logic_gt": 0,
                                "set_dummy": 0,
                                "event_key_onpush_any": 0,
                                "event_key_onpush_any_number": 0,
                                "math_number": 0,
                                "arduino_out_value": 0,
                                "arduino_pin": 0,
                                "arduino_out_write_logical": 0,
                                "math_number_repeats": 0,
                                "arduino_out_read_logical": 0,
                                "math_number_seconds": 0,
                                "arduino_out_write_pwm": 0,
                                "arduino_out_read_pwm": 0,
                                "controls_if": 0,
                                "controls_ifelse": 0
                            },
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
