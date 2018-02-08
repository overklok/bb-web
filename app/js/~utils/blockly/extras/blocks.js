const colour_circles_b64 = require('./colour-circles.json');

//================================================================
//                  XML-ПЕРЕОПРЕДЕЛЕНИЯ БЛОКОВ
//================================================================

const BUTTON_CODES = {
  UP:     "38",
  DOWN:   "40",
  LEFT:   "37",
  RIGHT:  "39",

  SYM_Q:  "81",
  SYM_W:  "87",
  SYM_E:  "69",
  SYM_R:  "82",
  SYM_T:  "84",
  SYM_Y:  "89",

  SYM_A:  "65",
  SYM_S:  "83",
  SYM_D:  "68",
  SYM_F:  "70",
  SYM_G:  "71",
  SYM_H:  "72",

  SYM_0:  "48",
  SYM_1:  "49",
  SYM_2:  "50",
  SYM_3:  "51",
  SYM_4:  "52",

  SYM_5:  "53",
  SYM_6:  "54",
  SYM_7:  "55",
  SYM_8:  "56",
  SYM_9:  "57",

};

// Ограничения ввода в блоках
const BLOCK_INPUTS_CONSTRAINTS = {
    // Максимальное число итераций в циклах
    MAX_REPEAT_TIMES: 500,
    // Максимальное время в команде "ждать"
    MAX_WAIT_SECONDS: 30,
    // Максимальное значение цветового компонента
    MAX_COMPONENT_VALUE: 250,
    // Список цветов
    COLOURS: [
        ["синий", "blue"],
        ["голубой", "light_blue"],
        ["зелёный", "green"],
        ["красный", "red"],
        ["жёлтый", "yellow"],
        ["оранжевый", "orange"],
        ["фиолетовый", "violet"],
        ["белый", "white"]
    ],
    // Список переменных яркостей
    BRIGHTNESSES: [
        ["яркость_1", "1"],
        ["яркость_2", "2"],
        ["яркость_3", "3"]
    ],
    // Список доступных кнопок для обработки нажатий
    ARROW_BUTTONS: [
      ['↑', BUTTON_CODES.UP   ],
      ['↓', BUTTON_CODES.DOWN ],
      ['←', BUTTON_CODES.LEFT ],
      ['→', BUTTON_CODES.RIGHT],

      ['0', BUTTON_CODES.SYM_0],
      ['1', BUTTON_CODES.SYM_1],
      ['2', BUTTON_CODES.SYM_2],
      ['3', BUTTON_CODES.SYM_3],
      ['4', BUTTON_CODES.SYM_4],
      ['5', BUTTON_CODES.SYM_5],
      ['6', BUTTON_CODES.SYM_6],
      ['7', BUTTON_CODES.SYM_7],
      ['8', BUTTON_CODES.SYM_8],
      ['9', BUTTON_CODES.SYM_9]
    ],

    LETTER_BUTTONS: [
      ['Q', BUTTON_CODES.SYM_Q],
      ['W', BUTTON_CODES.SYM_W],
      ['E', BUTTON_CODES.SYM_E],
      ['R', BUTTON_CODES.SYM_R],
      ['T', BUTTON_CODES.SYM_T],
      ['Y', BUTTON_CODES.SYM_Y],

      ['A', BUTTON_CODES.SYM_A],
      ['S', BUTTON_CODES.SYM_S],
      ['D', BUTTON_CODES.SYM_D],
      ['E', BUTTON_CODES.SYM_E],
      ['F', BUTTON_CODES.SYM_F],
      ['G', BUTTON_CODES.SYM_G]
    ],
    // Напраления смещения цветов лампочек гирлянды
    SLIDE_DIRECTIONS: [
        ['← влево', 'left'],
        ['→ вправо', 'right']
    ]
};

let BlocklyXMLBlocks = () => {
  let blocks = {

    led_color:              '<value name="NUM">' +
                              '<shadow type="led_number">' +
                                '<field name="NUM">1</field>' +
                              '</shadow>' +
                            '</value>',

    swap_leds:              '<value name="NUM1">' +
                              '<shadow type="led_number">' +
                                '<field name="NUM">1</field>' +
                              '</shadow>' +
                            '</value>'+
                            '<value name="NUM2">' +
                              '<shadow type="led_number">' +
                                '<field name="NUM">2</field>' +
                              '</shadow>' +
                            '</value>',


    controls_repeat_ext:    '<value name="TIMES">' +
                              '<shadow type="repeats_value">' +
                              // '<field name="TIMES">1</field>'
                              '</shadow>' +
                            '</value>',

    set_leds_mix:           '<value name="COLOR_RED">' +
                              '<shadow type="brightness_value_red">' +
                                '<field name="VALUE">0</field>' +
                              '</shadow>' +
                            '</value>' +
                            '<value name="COLOR_GREEN">' +
                              '<shadow type="brightness_value_green">' +
                                '<field name="VALUE">0</field>' +
                              '</shadow>' +
                            '</value>' +
                            '<value name="COLOR_BLUE">' +
                              '<shadow type="brightness_value_blue">' +
                                '<field name="VALUE">0</field>' +
                              '</shadow>' +
                            '</value>',

    set_led_mix:            '<value name="NUM">' +
                              '<shadow type="led_number">' +
                                '<field name="NUM">1</field>' +
                              '</shadow>' +
                            '</value>' +
                            '<value name="COLOR_RED">' +
                              '<shadow type="brightness_value_red">' +
                                '<field name="VALUE">0</field>' +
                              '</shadow>' +
                            '</value>' +
                            '<value name="COLOR_GREEN">' +
                              '<shadow type="brightness_value_green">' +
                                '<field name="VALUE">0</field>' +
                              '</shadow>' +
                            '</value>' +
                            '<value name="COLOR_BLUE">' +
                              '<shadow type="brightness_value_blue">' +
                                '<field name="VALUE">0</field>' +
                              '</shadow>' +
                            '</value>',

    set_brightness:         '<value name="VALUE">' +
                              '<shadow type="brightness_value">' +
                                '<field name="VALUE">0</field>' +
                              '</shadow>' +
                            '</value>',

    change_brightness_up:   '<value name="DIFF">' +
                              '<shadow type="brightness_diff">' +
                                '<field name="DIFF">0</field>' +
                              '</shadow>' +
                            '</value>',

    wait_seconds:           '<value name="SECS">' +
                              '<shadow type="seconds_value">' +
                                '<field name="SECS">1</field>' +
                              '</shadow>' +
                            '</value>',

    math_multiply:          '<value name="A">' +
                              '<shadow type="number">' +
                              '</shadow>' +
                            '</value>' +
                            '<value name="B">' +
                              '<shadow type="number">' +
                              '</shadow>' +
                            '</value>'
  };

  blocks.math_subtract          = blocks.math_multiply;

  blocks.led_off                = blocks.led_color;

  blocks.set_prev_led_mix       = blocks.set_next_led_mix
                                = blocks.set_leds_mix;

  blocks.change_brightness_down = blocks.change_brightness_up;

  return blocks;

};

//================================================================
//                  JSON-ОПРЕДЕЛЕНИЯ БЛОКОВ
//================================================================

let BlocklyJSONBlocks = () => {
  let blocks = {

    //==============================
    //        SHADOW-БЛОКИ
    //==============================

    led_number: {
      init: function () {
        this.jsonInit({
          "type": "block_type",
          "message0": "%1",
          "args0": [{
            "type": "field_number",
            "name": "NUM",
            "value": 0,
            "min": 1,
            "max": STRIP_LENGTH,
            "precision": 1
          }],
          "inputsInline": true,
          "output": "Number",
          "colour": 230,
          "tooltip": "",
          "helpUrl": ""
        })
      }
    },

    brightness_value: {
      init: function () {
        this.jsonInit({
          "type": "block_type",
          "message0": "%1",
          "args0": [{
            "type": "field_number",
            "name": "VALUE",
            "value": 0,
            "min": 0,
            "max": BLOCK_INPUTS_CONSTRAINTS.MAX_COMPONENT_VALUE,
            "precision": 1
          }],
          "inputsInline": true,
          "output": "Number",
          "colour": 230,
          "tooltip": "",
          "helpUrl": ""
        })
      }
    },

    brightness_value_red: {
      init: function () {
        this.jsonInit({
          "type": "block_type",
          "message0": "%1",
          "args0": [{
            "type": "field_number",
            "name": "VALUE",
            "value": 0,
            "min": 0,
            "max": BLOCK_INPUTS_CONSTRAINTS.MAX_COMPONENT_VALUE,
            "precision": 1
          }],
          "inputsInline": true,
          "output": "Number",
          "colour": 0,
          "tooltip": "",
          "helpUrl": ""
        })
      }
    },

    brightness_value_green: {
      init: function () {
        this.jsonInit({
          "type": "block_type",
          "message0": "%1",
          "args0": [{
            "type": "field_number",
            "name": "VALUE",
            "value": 0,
            "min": 0,
            "max": BLOCK_INPUTS_CONSTRAINTS.MAX_COMPONENT_VALUE,
            "precision": 1
          }],
          "inputsInline": true,
          "output": "Number",
          "colour": 120,
          "tooltip": "",
          "helpUrl": ""
        })
      }
    },

    brightness_value_blue: {
      init: function () {
        this.jsonInit({
          "type": "block_type",
          "message0": "%1",
          "args0": [{
            "type": "field_number",
            "name": "VALUE",
            "value": 0,
            "min": 0,
            "max": BLOCK_INPUTS_CONSTRAINTS.MAX_COMPONENT_VALUE,
            "precision": 1
          }],
          "inputsInline": true,
          "output": "Number",
          "colour": 240,
          "tooltip": "",
          "helpUrl": ""
        })
      }
    },

    brightness_diff: {
      init: function () {
        this.jsonInit({
          "type": "block_type",
          "message0": "%1",
          "args0": [{
            "type": "field_number",
            "name": "DIFF",
            "value": 0,
            "min": 0,
            "max": BLOCK_INPUTS_CONSTRAINTS.MAX_COMPONENT_VALUE,
            "precision": 1
          }],
          "inputsInline": true,
          "output": "Number",
          "colour": 230,
          "tooltip": "",
          "helpUrl": ""
        })
      }
    },

    seconds_value: {
      init: function () {
        this.jsonInit({
          "type": "block_type",
          "message0": "%1",
          "args0": [{
            "type": "field_number",
            "name": "SECS",
            "value": 1,
            "min": 0,
            "max": BLOCK_INPUTS_CONSTRAINTS.MAX_WAIT_SECONDS,
            "precision": 1
          }],
          "inputsInline": true,
          "output": "Number",
          "colour": 230,
          "tooltip": "",
          "helpUrl": ""
        })
      }
    },

    repeats_value: {
      init: function () {
        this.jsonInit({
          "type": "block_type",
          "message0": "%1",
          "args0": [{
            "type": "field_number",
            "name": "TIMES",
            "value": 1,
            "min": 0,
            "max": BLOCK_INPUTS_CONSTRAINTS.MAX_REPEAT_TIMES,
            "precision": 1
          }],
          "inputsInline": true,
          "output": "Number",
          "colour": 230,
          "tooltip": "",
          "helpUrl": ""
        })
      }
    },

    color_mix: {
      init: function () {
        this.jsonInit({
          "type": "block_type",
          "message0": "red %1 green %2 blue %3",
          "args0": [
            {
              "type": "input_value",
              "name": "COLOR_RED",
            },
            {
              "type": "input_value",
              "name": "COLOR_GREEN"
            },
            {
              "type": "input_value",
              "name": "COLOR_BLUE"
            }
          ],
          "inputsInline": true,
          "output": "Number",
          "colour": 230,
          "tooltip": "",
          "helpUrl": ""
        })
      }
    },

    number: {
      init: function () {
        this.jsonInit({
          "type": "block_type",
          "message0": "%1",
          "args0": [{
            "type": "field_number",
            "name": "NUM",
            "value": 2,
            "precision": 1
          }],
          "inputsInline": true,
          "output": "Number",
          "colour": 230,
          "tooltip": "",
          "helpUrl": ""
        })
    }
    },

    //==============================
    //       КОМАНДНЫЕ БЛОКИ
    //==============================

    leds_color: {
      init: function() {
        this.jsonInit({
          "message0": 'зажечь все лампочки цветом %1',
          "args0": [
            {
              "type": "field_dropdown",
              "name": "COLOR",
              "options": BLOCK_INPUTS_CONSTRAINTS.COLOURS
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "inputsInline": true,
          "colour": 160,
          "tooltip": "Все лампочки гирлянды зажигаются указанным цветом"
        });
      }
    },

    leds_off: {
      init: function() {
        this.jsonInit({
          "message0": 'потушить все лампочки',
          "previousStatement": null,
          "nextStatement": null,
          "inputsInline": true,
          "colour": 160,
          "tooltip": "Все лампочки гирлянды выключаются"
        });
      }
    },

    led_off: {
      init: function() {
        this.jsonInit({
          "message0": 'потушить лампочку номер %1',
          "args0": [
            {
              "type": "input_value",
              "name": "NUM"
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "inputsInline": true,
          "colour": 160,
          "tooltip": "Лампочка с указанным номером гаснет"
        });
      }
    },

    swap_leds: {
      init: function() {
        this.jsonInit({
          "message0": 'поменять цветами %1 и %2',
          "args0": [
            {
              "type": "input_value",
              "name": "NUM1"
            },
            {
              "type": "input_value",
              "name": "NUM2"
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "inputsInline": true,
          "colour": 160,
          "tooltip": "Лампочки с указанными номерами обмениваются цветом"
        });
      }
    },

    led_color: {
      init: function() {
        this.jsonInit({
          "message0": 'зажечь лампочку номер %1 цветом %2',
          "args0": [
            {
              "type": "input_value",
              "name": "NUM"
            },
            {
              "type": "field_dropdown",
              "name": "COLOR",
              "options": BLOCK_INPUTS_CONSTRAINTS.COLOURS
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "inputsInline": true,
          "colour": 160,
          "tooltip": "Лампочка с указанным номером зажигается указанным цветом"
        });
      }
    },

    set_next_led: {
      init: function() {
        this.jsonInit({
          "message0": 'зажечь следующую лампочку цветом %1',
          "args0": [
            {
              "type": "field_dropdown",
              "name": "COLOR",
              "options": BLOCK_INPUTS_CONSTRAINTS.COLOURS
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "inputsInline": true,
          "colour": 160,
          "tooltip": "Следующая лампочка гирлянды зажигается указанным цветом"
        });
      }
    },

    set_prev_led: {
      init: function() {
        this.jsonInit({
          "message0": 'зажечь предыдущую лампочку цветом %1',
          "args0": [
            {
              "type": "field_dropdown",
              "name": "COLOR",
              "options": BLOCK_INPUTS_CONSTRAINTS.COLOURS
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "inputsInline": true,
          "colour": 160,
          "tooltip": "Предыдущая лампочка гирлянды зажигается указанным цветом"
        });
    }
    },

    set_leds_mix: {
      init: function() {
        this.jsonInit({
          "message0": "задать цвет всех лампочек: %1 %2 %3 %4 %5 %6 %7",
          "args0": [
            {
              "type": "input_dummy"
            },
            {
              "type": "field_image",
              "src": colour_circles_b64.red,
              "width": 15,
              "height": 15,
              "alt": "*"
            },
            {
              "type": "input_value",
              "name": "COLOR_RED",
              "align": "RIGHT"
            },
            {
              "type": "field_image",
              "src": colour_circles_b64.green,
              "width": 15,
              "height": 15,
              "alt": "*"
            },
            {
              "type": "input_value",
              "name": "COLOR_GREEN",
              "align": "RIGHT"
            },
            {
              "type": "field_image",
              "src": colour_circles_b64.blue,
              "width": 15,
              "height": 15,
              "alt": "*"
            },
            {
              "type": "input_value",
              "name": "COLOR_BLUE",
              "align": "RIGHT"
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "inputsInline": true,
          "colour": 160,
          "tooltip": "Вся гирлянда зажигается комбинацией трёх основных цветов"
        });
      }
    },

    set_led_color_mix: {
      init: function() {
        this.jsonInit({
          "message0": "зажечь лампочку № %1 : %2 %3 %4 %5 %6 %7",
          "args0": [
            {
              "type": "input_value",
              "name": "NUM"
            },
            {
              "type": "field_image",
              "src": colour_circles_b64.red,
              "width": 15,
              "height": 15,
              "alt": "*"
            },
            {
              "type": "input_value",
              "name": "COLOR_RED",
              "align": "RIGHT"
            },
            {
              "type": "field_image",
              "src": colour_circles_b64.green,
              "width": 15,
              "height": 15,
              "alt": "*"
            },
            {
              "type": "input_value",
              "name": "COLOR_GREEN",
              "align": "RIGHT"
            },
            {
              "type": "field_image",
              "src": colour_circles_b64.blue,
              "width": 15,
              "height": 15,
              "alt": "*"
            },
            {
              "type": "input_value",
              "name": "COLOR_BLUE",
              "align": "RIGHT"
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "inputsInline": true,
          "colour": 160,
          "tooltip": "Указанная лампочка зажигается комбинацией трёх основных цветов"
        });
      }
    },

    set_next_led_mix: {
      init: function() {
        this.jsonInit({
          "message0": "зажечь следующую лампочку: %1 %2 %3 %4 %5 %6 %7",
          "args0": [
            {
              "type": "input_dummy"
            },
            {
              "type": "field_image",
              "src": colour_circles_b64.red,
              "width": 15,
              "height": 15,
              "alt": "*"
            },
            {
              "type": "input_value",
              "name": "COLOR_RED",
              "align": "RIGHT"
            },
            {
              "type": "field_image",
              "src": colour_circles_b64.green,
              "width": 15,
              "height": 15,
              "alt": "*"
            },
            {
              "type": "input_value",
              "name": "COLOR_GREEN",
              "align": "RIGHT"
            },
            {
              "type": "field_image",
              "src": colour_circles_b64.blue,
              "width": 15,
              "height": 15,
              "alt": "*"
            },
            {
              "type": "input_value",
              "name": "COLOR_BLUE",
              "align": "RIGHT"
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "inputsInline": true,
          "colour": 160,
          "tooltip": "Следующая лампочка зажигается комбинацией трёх основных цветов"
        });
      }
    },

    set_prev_led_mix: {
      init: function() {
        this.jsonInit({
            "message0": "зажечь предыдущую лампочку: %1 %2 %3 %4 %5 %6 %7",
            "args0": [
              {
                "type": "input_dummy"
              },
              {
                "type": "field_image",
                "src": colour_circles_b64.red,
                "width": 15,
                "height": 15,
                "alt": "*"
              },
              {
                "type": "input_value",
                "name": "COLOR_RED",
                "align": "RIGHT"
              },
              {
                "type": "field_image",
                "src": colour_circles_b64.green,
                "width": 15,
                "height": 15,
                "alt": "*"
              },
              {
                "type": "input_value",
                "name": "COLOR_GREEN",
                "align": "RIGHT"
              },
              {
                "type": "field_image",
                "src": colour_circles_b64.blue,
                "width": 15,
                "height": 15,
                "alt": "*"
              },
              {
                "type": "input_value",
                "name": "COLOR_BLUE",
                "align": "RIGHT"
              }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "inputsInline": true,
          "colour": 160,
          "tooltip": "Предыдущая лампочка зажигается комбинацией трёх основных цветов"
        });
      }
    },

    slide_leds: {
      init: function() {
        this.jsonInit({
          "message0": 'сдвинуть гирлянду %1',
          "args0": [
            {
              "type": "field_dropdown",
              "name": "DIRECTION",
              "options": BLOCK_INPUTS_CONSTRAINTS.SLIDE_DIRECTIONS
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "inputsInline": true,
          "colour": 160,
          "tooltip": "Каждая следующая лампочка загорается цветом предыдущей (или наоборот)"
        });
      }
    },

    wait_seconds: {
      init: function() {
        this.jsonInit({
          "message0": 'ждать %1 сек.',
          "args0": [
            {
              "type": "input_value",
              "name": "SECS"
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "inputsInline": true,
          "colour": 50,
          "tooltip": "Программа остановится на указанное количество секунд"
        });
     }
    },

    set_brightness: {
      init: function() {
        this.jsonInit({
          "message0": "установить %1 равной %2",
          "args0": [
            {
              "type": "field_dropdown",
              "name": "NUM",
              "options": BLOCK_INPUTS_CONSTRAINTS.BRIGHTNESSES
            },
              {
              "type": "input_value",
              "name": "VALUE"
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "inputsInline": true,
          "colour": 160,
          "tooltip": "Установить значение для указанной переменной яркости"
        });
      }
    },

    change_brightness_up: {
      init: function() {
        this.jsonInit({
          "message0": "увеличить %1 на %2",
          "args0": [
            {
              "type": "field_dropdown",
              "name": "NUM",
              "options": BLOCK_INPUTS_CONSTRAINTS.BRIGHTNESSES
            },
            {
              "type": "input_value",
              "name": "DIFF"
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "inputsInline": true,
          "colour": 160,
          "tooltip": "Увеличить значение указанной переменной яркости"
        });
      }
    },

    change_brightness_down: {
      init: function() {
        this.jsonInit({
            "message0": "уменьшить %1 на %2",
            "args0": [
              {
                "type": "field_dropdown",
                "name": "NUM",
                "options": BLOCK_INPUTS_CONSTRAINTS.BRIGHTNESSES
              },
              {
                "type": "input_value",
                "name": "DIFF"
              }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "inputsInline": true,
            "colour": 160,
            "tooltip": "Уменьшить значение указанной переменной яркости"
        });
      }
    },

    //==============================
    //     МАТЕМАТИЧЕСКИЕ БЛОКИ
    //==============================

    math_multiply: {
      init: function() {
        this.jsonInit({
            "message0": "%1 %{BKY_MATH_MULTIPLICATION_SYMBOL} %2",
            "args0": [
              {
                "type": "input_value",
                "name": "A"
              },
              {
                "type": "input_value",
                "name": "B"
              }
            ],
            "inputsInline": true,
            "output": "Number",
            "colour": "%{BKY_MATH_HUE}"
        });
      }
    },

    math_subtract: {
      init: function() {
        this.jsonInit({
          "message0": "%1 %{BKY_MATH_SUBTRACTION_SYMBOL} %2",
          "args0": [
            {
              "type": "input_value",
              "name": "A",
              "check": "Number"
            },
            {
              "type": "input_value",
              "name": "B",
              "check": "Number"
            }
          ],
          "inputsInline": true,
          "output": "Number",
          "colour": "%{BKY_MATH_HUE}"
        });

    }
    },

    //==============================
    //         БЛОКИ ВЫВОДА
    //==============================

    get_brightness: {
      init: function() {
       this.jsonInit({
         "type": "block_type",
         "message0": "%1",
         "args0": [{
           "type": "field_dropdown",
           "name": "NUM",
           "options": BLOCK_INPUTS_CONSTRAINTS.BRIGHTNESSES
         }],
         "inputsInline": false,
         "output": "Number",
         "colour": 230,
         "tooltip": "Возвращает значение выбранной переменной яркости"
       })
     }
    },

    get_led_num: {
      init: function() {
        this.jsonInit({
          "type": "block_type",
          "message0": "номер лампочки",
          "inputsInline": false,
          "output": "Number",
          "colour": 230,
          "tooltip": "Возвращает номер текущей лапмочки"
        })
     }
    },

    //================================
    //         БЛОКИ СОБЫТИЙ
    //================================

    arrow_btn_pressed: {
      init: function () {
        this.jsonInit({
          "type": "block_type",
          "message0": "когда нажата кнопка %1 %2",
          "args0": [
            {
              "type": "field_dropdown",
              "name": "SCANCODE",
              "options": BLOCK_INPUTS_CONSTRAINTS.ARROW_BUTTONS
            },
            {
              "type": "input_statement",
              "name": "DO"
            }
          ],
          "colour": 230,
          "tooltip": "",
          "helpUrl": ""
        })
      }
    },

    letter_btn_pressed: {
      init: function () {
        this.jsonInit({
          "type": "block_type",
          "message0": "когда нажата буква %1 %2",
          "args0": [
            {
              "type": "field_dropdown",
              "name": "SCANCODE",
              "options": BLOCK_INPUTS_CONSTRAINTS.LETTER_BUTTONS
            },
            {
              "type": "input_statement",
              "name": "DO"
            }
          ],
          "colour": 230,
          "tooltip": "",
          "helpUrl": ""
        })
      }
    }
  };

  return blocks;
};

let JSONBlocks = BlocklyJSONBlocks();
let XMLBlocks = BlocklyXMLBlocks();

export {JSONBlocks, XMLBlocks};