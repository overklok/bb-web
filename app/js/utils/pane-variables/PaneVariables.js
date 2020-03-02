import './styles/main.css';

const CLASSES = {
    CONTAINER_MAIN: "variables-pane",
    ANIMATION: "pulse"
};

const VARIABLES = {
    "strip_colour":     {
        title: "цвет",
        class: "var-colour",
        initial_value: "#000000"
    },
    "strip_index":      {
        title: "лампочка",
        class: "var-index",
        initial_value: 0
    },
    "strip_brightness":      {
        title: "яркость",
        class: "var-brightness",
        initial_value: 0
    }
};

const TEXT_CLASSES    = ["var-index", "var-brightness"];
const COLOUR_CLASSES  = ["var-colour"];

export default class PaneVariables {
    constructor() {
        this.variables = {};

        this.columns = {
            col1: undefined,
            col2: undefined
        };

        this._state = {
            included: false
        }
    }

    /**
     * Встроить панель
     *
     * @param dom_node
     */
    include(dom_node) {
        if (!dom_node) {throw new TypeError("DOM Node is not defined")}

        if (this._state.included) {throw new Error("Pane already included")}

        this._container = document.createElement("div");
        this._container.classList.add(CLASSES.CONTAINER_MAIN);

        this.columns.col1 = document.createElement("div");
        this.columns.col2 = document.createElement("div");

        this.columns.col1.classList.add("variables-column");
        this.columns.col2.classList.add("variables-column");

        this._container.appendChild(this.columns.col1);
        this._container.appendChild(this.columns.col2);

        dom_node.appendChild(this._container);

        this._state.included = true;
    }

    dispose() {
        if (this._state.included) {
            this._container.remove();

            this._state.included = false;
        }
    }

    addVariable(name, initial_value) {
        if (!(name in VARIABLES)) {
            console.warn(`An attempt of pushing variable with unknown name '${name}' was made.`);
            return;
        }

        initial_value = initial_value ? initial_value : VARIABLES[name].initial_value;

        let wrapper = document.createElement("div");
        wrapper.classList.add('variable');
        wrapper.classList.add(VARIABLES[name].class);

        let node_name = document.createElement("div");
        node_name.classList.add('variable-name');
        node_name.innerHTML = `<span>${VARIABLES[name].title}</span>`;

        let node_value = document.createElement("div");
        node_value.classList.add('variable-value');
        node_value.setAttribute('id', name);

        let text_node = null;

        if (TEXT_CLASSES.indexOf(VARIABLES[name].class) >= 0) {
            text_node = document.createElement('p');
            node_value.appendChild(text_node);
        }

        wrapper.appendChild(node_name);
        wrapper.appendChild(node_value);

        this.variables[name] = {node: node_value, wrapper: wrapper, text_node};

        this.setValue(name, initial_value, false);

        this.columns.col1.appendChild(wrapper);
    }

    removeVariable(name) {
        if (!(name in this.variables)) throw new RangeError(`Variable '${name} is deleted already or not exist.`);

        this.variables[name].node.remove();

        delete this.variables[name];
    }

    removeAllVariables() {
        this.variables = {};

        while (this.columns.col1.firstChild) {
            this.columns.col1.removeChild(this.columns.col1.firstChild);
        }

        while (this.columns.col2.firstChild) {
            this.columns.col2.removeChild(this.columns.col2.firstChild);
        }
    }

    removeSensors() {
        for (let name in this.variables) {
            if (this.variables.hasOwnProperty(name)) {
                if (this.variables[name].node_value_pwm) {
                    this.removeVariable(name);
                }
            }
        }
    }

    setSensorValues(values, animate=true) {
        for (const [i, value] of values.entries()) {
            this.setValue("SNS"+i, value);
        }
    }

    setValue(name, value, animate=true) {
        if (!(name in this.variables)) return;

        if (animate) {
            this.variables[name].wrapper.classList.add(CLASSES.ANIMATION);
            this.variables[name].animated = true;
        }

        setTimeout(() => {
            if ((name in this.variables) && this.variables[name].animated) {
                this.variables[name].wrapper.classList.remove(CLASSES.ANIMATION);
                this.variables[name].animated = false;
            }
        }, 500);

        if (this.variables[name].node_value_pwm) {
            this.variables[name].text_node.innerText = value;
            return;
        }

        if (TEXT_CLASSES.indexOf(VARIABLES[name].class) >= 0) {
            this.variables[name].text_node.innerText = value;
            return;
        }

        if (COLOUR_CLASSES.indexOf(VARIABLES[name].class) >= 0) {
            this.variables[name].node.style.backgroundColor = '#' + value;
            return;
        }

        console.warn(`Tried to set value '${value}' for variable '${name}', but it\`s class cannot be handled.`);
    }

    setSensorValue(sensor_number, value, animate) {
        let sensor_name = "SNS" + sensor_number;

        this.setValue(sensor_name, value, animate);
    }

    setSensorPWM(sensor_number, on=false) {
        let sensor_name = "SNS" + sensor_number;

        this._setSensorPWMByName(sensor_name, on);
    }

    setSensorVoltage(sensor_number, on=false) {
        let sensor_name = "SNS" + sensor_number;

        this._setSensorVoltageByName(sensor_name, on);
    }

    _setSensorPWMByName(name, on=false) {
        if (!(name in this.variables)) return;

        if (this.variables[name].node_value_pwm) {
            this.variables[name].node_value_pwm.style.opacity = on ? 1 : 0;
        }
    }

    _setSensorVoltageByName(name, on=false) {
        if (!(name in this.variables)) return;

        if (this.variables[name].node_value_voltage) {
            this.variables[name].node_value_voltage.style.opacity = on ? 1 : 0;
        }
    }

    addSensors() {
        for (let i = 0; i < 10; i++) {
            this._addSensor('SNS'+i, 'A'+i, 0, i < 5 ? 1 : 2);
        }
    }

    _addSensor(name, title, initial_value, col_num=1) {
        let wrapper = document.createElement("div");
        wrapper.classList.add('sensor');
        wrapper.classList.add('arduino-analog');

        let node_name = document.createElement("div");
        node_name.classList.add('sensor-name');
        node_name.innerHTML = `<span>${title}</span>`;

        let node_value = document.createElement("div");
        node_value.classList.add('sensor-value');
        node_value.setAttribute('id', name);

        let node_value_pwm = document.createElement("div");
        node_value_pwm.classList.add('sensor-value');
        node_value_pwm.classList.add('sensor-value-pwm');
        node_value_pwm.setAttribute('id', name + 'PWM');
        node_value_pwm.innerText = "ШИМ";

        let node_value_voltage = document.createElement("div");
        node_value_voltage.classList.add('sensor-value');
        node_value_voltage.classList.add('sensor-value-voltage');
        node_value_voltage.setAttribute('id', name + 'VOLTAGE');
        node_value_voltage.innerText = "НАПР";

        let text_node = document.createElement('p');
        node_value.appendChild(text_node);

        wrapper.appendChild(node_name);
        wrapper.appendChild(node_value_pwm);
        wrapper.appendChild(node_value_voltage);
        wrapper.appendChild(node_value);

        this.variables[name] = {node: node_value, wrapper: wrapper, text_node, node_value_pwm, node_value_voltage};

        this.setValue(name, initial_value, false);
        this._setSensorPWMByName(name, false);
        this._setSensorVoltageByName(name, false);

        // if (col_num === 1) {
            this.columns.col1.appendChild(wrapper);
        // } else {
        //     this.columns.col2.appendChild(wrapper);
        // }
    }

    static _generateSVGTextNode(initial_value="") {
        let node_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        node_svg.setAttributeNS(null, "width", "100%");
        node_svg.setAttributeNS(null, "height", "100%");
        node_svg.setAttributeNS(null, "viewBox", "0 -200 800 500");

        let node_text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

        node_text.setAttributeNS(null, "font-size", "450");
        node_text.setAttributeNS(null, "fill", "black");
        node_text.setAttributeNS(null, "x", "50%");
        node_text.setAttributeNS(null, "y", "40%");
        node_text.textContent = initial_value;

        node_svg.appendChild(node_text);


        return [node_svg, node_text];
    }
}