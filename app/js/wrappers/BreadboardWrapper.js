import Wrapper from "../core/Wrapper";

import Breadboard from "../~utils/breadboard/Breadboard";

const PLATE_TYPES = {
    'resistor':     ['resistor', 'резистор'],
    'res':          ['resistor', 'резистор'],
    'bridge':       ['bridge', 'перемычка'],
    'capacitor':    ['capacitor', 'конденсатор'],
    'strip':        ['strip', 'лента']
};

/**
 * Обёртка библиотеки Breadboard для отображения макетной платы
 */
class BreadboardWrapper extends Wrapper {
    constructor() {
        super();

        this._plugin = new Breadboard();

        this._onchange = function(data) {console.warn("BreadboardWrapper's `onchange` event emitted with data: ", data)};
    }

    /**
     * Встроить Breadboard в DOM-дерево
     *
     * @param {object}  dom_node    DOM-узел, в который нужно вставить Breadboard
     * @param {boolean} read_only   Режим только чтения
     */
    inject(dom_node, read_only=true) {
        if (!dom_node) {
            throw new TypeError("DOM Node must be defined");
        }

        if (!read_only) {
            this._generatePlateSelector(dom_node);
            this._plugin.onChange((data) => {this._onchange(data)});
        }

        this._plugin.inject(dom_node, {
            readOnly: read_only,
        });
    }

    /**
     * Удалить Breadboard из DOM-дерева
     *
     * Сам экземпляр Breadboard, его содержимое и параметры отображения сохраняются
     */
    eject() {
        this._plugin.dispose();
    }

    getPlates() {
        return this._plugin.getPlates();
    }

    setPlates(plates) {
        this._plugin.clearPlates();

        for (let plate of plates) {
            plate.extra = plate.extra || plate.number;
            this._plugin.addPlate(PLATE_TYPES[plate.type][0], plate.x, plate.y, plate.orientation, plate.id, plate.extra);
        }
    }

    setPlateState(plate_id, state) {
        this._plugin.setPlateState(plate_id, state);
    }

    setCurrent(points) {
        this._plugin._layers.current.removeAllCurrents();

        this._plugin._layers.current.addCurrentGood(points);
    }

    onChange(cb) {
        this._onchange = cb;
    }

    _generatePlateSelector(dom_node) {
        let wrap = document.createElement("div");
        let input = document.createElement("input");
        let select = document.createElement("select");
        let btn_apply = document.createElement("a");

        wrap.classList += "bb-plate-add-wrap";
        input.classList += "bb-plate-add-input";
        select.classList += "bb-plate-add-selector";
        btn_apply.classList += "bb-plate-add-btn";

        wrap.style.cssText  += "position: absolute; bottom: 0;";
        input.style.cssText += "width: 40px";
        select.style.cssText += "width: 100px";
        input.setAttribute("type", "number");
        input.setAttribute("min", 0);

        let options = Breadboard.getAllPlateTypes();

        for (let i = 0; i < options.length; i++) {
            let opt = options[i];
            let el = document.createElement("option");
            el.textContent = PLATE_TYPES[opt][1];
            el.value = opt;

            select.appendChild(el);
        }

        btn_apply.addEventListener("click", () => {
            let plate_type = select.options[select.selectedIndex].value;
            let extra = input.value;

            this._plugin.addPlate(plate_type, 0, 0, 'west', null, extra);

            this._onchange({
                id: null,
                action: 'create'
            })
        });

        btn_apply.innerHTML = "Добавить";

        wrap.appendChild(select);
        wrap.appendChild(input);
        wrap.appendChild(btn_apply);
        dom_node.appendChild(wrap);
    }
}

export default BreadboardWrapper;