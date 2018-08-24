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

        let inner_node = null,
            text_node = null;

        if (TEXT_CLASSES.indexOf(VARIABLES[name].class) >= 0) {
            [inner_node, text_node] = PaneVariables._generateSVGTextNode();
            node_value.appendChild(inner_node);
        }

        wrapper.appendChild(node_name);
        wrapper.appendChild(node_value);

        this.variables[name] = {node: node_value, wrapper: wrapper, text_node};

        this.setValue(name, initial_value, false);

        this._container.appendChild(wrapper);
    }

    removeVariable(name) {
        if (!(name in this.variables)) throw new RangeError(`Variable '${name} is deleted already or not exist.`);

        this.variables[name].node.remove();

        delete this.variables[name];
    }

    removeAllVariables() {
        this.variables = {};

        while (this._container.firstChild) {
            this._container.removeChild(this._container.firstChild);
        }
    }

    setValue(name, value, animate=true) {
        console.log("SETVAL", name, value);

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

        if (TEXT_CLASSES.indexOf(VARIABLES[name].class) >= 0) {
            this.variables[name].text_node.textContent = value;
            return;
        }

        if (COLOUR_CLASSES.indexOf(VARIABLES[name].class) >= 0) {
            this.variables[name].node.style.backgroundColor = '#' + value;
            return;
        }

        console.warn(`Tried to set value '${value}' for variable '${name}', but it\`s class cannot be handled.`);
    }

    static _generateSVGTextNode(initial_value="") {
        let node_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        node_svg.setAttributeNS(null, "width", "100%");
        node_svg.setAttributeNS(null, "height", "100%");
        node_svg.setAttributeNS(null, "viewBox", "0 -200 2000 300");

        let node_text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

        node_text.setAttributeNS(null, "font-size", "450");
        node_text.setAttributeNS(null, "fill", "black");
        node_text.setAttributeNS(null, "x", "50%");
        node_text.setAttributeNS(null, "y", "35%");
        node_text.textContent = initial_value;

        node_svg.appendChild(node_text);


        return [node_svg, node_text];
    }
}