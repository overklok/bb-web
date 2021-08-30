import SVG from "svg.js";
import isEqual from "lodash/isEqual";

import Grid from "../core/Grid";
import Layer from "../core/Layer";
import {getCursorPoint, getRandomInt} from "../core/extras/helpers";

import Plate, {
    PlateProps,
    PlateState,
    SerializedPlate,
    SerializedPlatePosition
} from "../core/Plate";

import ContextMenu from "../core/ContextMenu";
import PlateContextMenu from "../menus/PlateContextMenu";
import ResistorPlate        from "../plates/ResistorPlate";
import PhotoresistorPlate   from "../plates/PhotoresistorPlate";
import RheostatPlate        from "../plates/RheostatPlate";
import BridgePlate          from "../plates/BridgePlate";
import ButtonPlate          from "../plates/ButtonPlate";
import SwitchPlate          from "../plates/SwitchPlate";
import CapacitorPlate       from "../plates/CapacitorPlate";
import TransistorPlate      from "../plates/TransistorPlate";
import InductorPlate        from "../plates/InductorPlate";
import RelayPlate           from "../plates/RelayPlate";
import DiodePlate           from "../plates/LEDPlate";
import MotorPlate           from "../plates/MotorPlate";
import RGBPlate             from "../plates/RGBPlate";
import DummyPlate           from "../plates/DummyPlate";
import BuzzerPlate          from "../plates/BuzzerPlate";
import UnkPlate from "../plates/UnkPlate";
import Cell from "../core/Cell";

/**
 * Helper type for raw plate data objects
 */
type PlateData = {
    id: number;
    type: string;
    orientation: string;
    x: number;
    y: number;
    extra: string|number;
    properties: {};
}

/**
 * Object describing required conditions for specific type of plate
 * when generating random plate compositions
 */
export type PlatePrototype = {
    type: string;
    quantity: number;
    properties: PlateProps;
}

/**
 * Visual properties of plates
 */
type PlateStyle = {
    quad_size: number;
    led_size: number;
    label_font_size: number;
}

/**
 * Types of user actions notified in plate change events
 */
enum PlateChangeActionType {
    /** plate's input/output has been changed */
    State = 'state',
    /** plate has been rotated */
    Rotate = 'rotate',
    /** plate has been moved */
    Move = 'move',
    /** plate has been removed */
    Remove = 'remove'
}

/**
 * Description of a single plate change on the board
 * 
 * This type of argument is used to notify user-driven actions in 
 * 'plate change' events (plates has been changed manually via UI)
 */
type PlateChangeCallbackArg = {
    id: number;
    action: PlateChangeActionType;
}

/**
 * Description of a massive plate change on the board
 * 
 * This type of argument is used to notify external changes in 
 * 'plate change' events (plates has been changed programmatically via API)
 */
type MassChangeCallbackArg = { [key: number]: Plate }

/**
 * An argument that is passed to the 'plate change' event handler when triggered
 */
type ChangeCallbackArg = PlateChangeCallbackArg | MassChangeCallbackArg;

/**
 * A 'plate change' event handler
 */
type ChangeCallback = (data: ChangeCallbackArg) => void;

/**
 * An object that imitates real mouse events
 * when calling some handlers manually
 */
type PseudoMouseEvent = {
    which: number;
    clientX: number;
    clientY: number;
}

/**
 * Contains plates, provides an API to create, delete plates and update their states
 * 
 * Provides an admin user interface to compose plates on the board and 
 * to manually change their individual states by instantiating and managing 
 * {@link Plate} instances.
 * 
 * Also allows to listen to manual and programmatical changes in the composition.
 */
export default class PlateLayer extends Layer<SVG.Container> {
    /** CSS class of the layer */
    static get Class() {return "bb-layer-plate"}

    /**
     * list of {@link Plate} types which are invariant to 180-degree rotation
     * 
     * TODO: Move this information to Plate classes
     */
    static get TypesReversible() {
        return [
            BridgePlate.Alias,
            ResistorPlate.Alias,
            PhotoresistorPlate.Alias,
            CapacitorPlate.Alias,
            ButtonPlate.Alias,
            InductorPlate.Alias,
            BuzzerPlate.Alias,
            DummyPlate.Alias,
            UnkPlate.Alias,
        ];
    }

    /** local event handlers */
    private _callbacks: {
        change: ChangeCallback;
        dragstart: (plate: Plate) => void;
    };

    /** SVG container in which the {@link Plate} instances will be rendered */
    private _plategroup: SVG.Container;

    /** {@link Plate} instances which currently forms the current composition, keyed by its identifiers */
    private _plates: {[key: number]: Plate};
    /** [debug only] {@link Plate} instances that were overwritten accidentally (to detect leakages or key assignment issues). Keys are salted to keep possible duplicates */
    private _plates_old: {[key: string]: Plate};

    /** the {@link Cell} where the {@link Plate} should go if user interrupts dragging */
    private _cell_supposed: Cell;
    /** the {@link Plate} the user is currently dragging */
    private _plate_dragging: Plate;
    /** the {@link Plate} that is currently in focus */
    private _plate_selected: Plate;

    /** is user actions are available at the moment */
    private _editable: boolean;

    /** the last point where 'mousedown' event has been triggered last time */
    private _cursor_point_mousedown: any;

    /**
     * Checks if two plates are visually identical 
     * 
     * Visual identity differs from exact equality for several reasons:
     *  - there are multiple combinations of position an orientation that leads to 
     *    same cell occupancy, which is needed for visual similarity
     *  - some types of {@link Plate} are indepenent of opposite orientations
     * 
     * @param svg           arbitrary SVG document to initialize test board
     * @param grid          {@link Grid} of the test board, must be the same 
     *                      as the one used to place the plates being compared
     * @param plate1_data   raw data object defining properties of the first plate
     * @param plate2_data   raw data object defining properties of the second plate
     * 
     * @returns are the plates visually identical
     */
    static comparePlates(svg: SVG.Container, grid: Grid, plate1_data: PlateData, plate2_data: PlateData) {
        if (plate1_data.type !== plate2_data.type) return false;
        if (!isEqual(plate1_data.properties, plate2_data.properties)) return false;

        let is_orientation_equal = plate1_data.orientation === plate2_data.orientation;

        if (PlateLayer.TypesReversible.indexOf(plate1_data.type) === -1) {
            if (!is_orientation_equal) return false;
            if (plate1_data.x !== plate2_data.x || plate1_data.y !== plate2_data.y) return false;
        } else {
            const plate1 = PlateLayer.jsonToPlate(svg, grid, plate1_data),
                  plate2 = PlateLayer.jsonToPlate(svg, grid, plate2_data);

            const {x: p1_x0, y: p1_y0} = plate1.pos,
                  {x: p2_x0, y: p2_y0} = plate2.pos,
                  p1_surf_points = plate1.surface,
                  p2_surf_points = plate2.surface;

            for (const p1_surf_point of p1_surf_points) {
                const {x: p1_x, y: p1_y} = Plate._orientXYObject(p1_surf_point, plate1.state.orientation);

                let has_same_point = false;

                for (const p2_surf_point of p2_surf_points) {
                    const {x: p2_x, y: p2_y} = Plate._orientXYObject(p2_surf_point, plate2.state.orientation);

                    if ((p1_x0 + p1_x === p2_x0 + p2_x) && (p1_y0 + p1_y === p2_y0 + p2_y)) {
                        has_same_point = true;
                        break;
                    }
                }

                if (has_same_point === false) return false;
            }
        }

        return true;
    }

    static jsonToPlate(svg: SVG.Container, grid: Grid, plate_data: PlateData) {
        const {type, position: {cell: {x, y}, orientation}, properties} = plate_data as any;

        const plate_class = PlateLayer.typeToPlateClass(type);
        const plate = new plate_class(svg, grid, false, false, null, properties);
        plate.draw(grid.cell(x, y), orientation, false);

        return plate;
    }

    /**
     * @inheritdoc
     */
    constructor(
        container: SVG.Container,
        grid: Grid,
        schematic: boolean = false,
        detailed: boolean = false,
        verbose: boolean = false
    ) {
        super(container, grid, schematic, detailed, verbose);

        this._container.addClass(PlateLayer.Class);

        this._callbacks = {
            change: () => {},
            dragstart: () => {},
        };

        this._plates = {};
        this._plategroup = undefined;

        this._cell_supposed = undefined;
        this._plate_dragging = undefined;
        this._plate_selected = undefined;
        this._editable = false;

        /// Последняя позиция перемещения курсора
        this._cursor_point_mousedown = undefined;

        this._handleKey = this._handleKey.bind(this);
        this._handleClick = this._handleClick.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleContextMenu = this._handleContextMenu.bind(this);
    }

    /**
     * @inheritdoc
     */
    compose() {
        this._initGroups();
    }

    /**
     * @inheritdoc
     * 
     * Also, re-instantiates all {@link Plate} instances with all its properties and states. 
     */
    recompose(schematic: boolean, detailed: boolean, verbose: boolean) {
        super.recompose(schematic, detailed, verbose);

        let plates_data = this.getSerializedPlates();

        this.removeAllPlates();

        this._initGroups();

        for (let plate_data of plates_data) {
            this.addPlate(
                plate_data.type,
                plate_data.position.cell.x,
                plate_data.position.cell.y,
                plate_data.position.orientation,
                plate_data.id,
                plate_data.properties,
                false
            );
        }
    }

    /**
     * Sets allowed visual properties of plates
     * 
     * @param style visual properties of plates
     */
    setPlateStyle(style: PlateStyle) {
        if (style && style.quad_size != null) {
            Plate.QuadSizePreferred = style.quad_size;
        } else {
            Plate.QuadSizePreferred = Plate.QuadSizeDefault;
        }

        if (style && style.led_size != null) {
            Plate.LEDSizePreferred = style.led_size;
        } else {
            Plate.LEDSizePreferred = Plate.LEDSizeDefault;
        }

        if (style && style.label_font_size != null) {
            Plate.LabelFontSizePreferred = style.label_font_size;
        } else {
            Plate.LabelFontSizePreferred = Plate.LabelFontSizeDefault;
        }
    }

    /**
     * Serializes plates of the current composition
     *
     * @returns serialized data of current plates
     */
    getSerializedPlates(): SerializedPlate[] {
        let data = [];

        for (let plate_id of Object.keys(this._plates)) {
            let plate = this._plates[Number(plate_id)];

            data.push(plate.serialize());
        }

        return data;
    }

    /**
     * Gets plate instance by its identifier
     *
     * @param plate_id plate identifier
     * 
     * @returns plate instance if exists
     */
    getPlateById(plate_id: number): Plate {
        if (!(plate_id in this._plates)) {
            throw new RangeError("Plate does not exist");
        }

        return this._plates[plate_id];
    }

    /**
     * Compiles random composition of plates based on their prototypes
     * 
     * The method will generate random number of plates (within the limits given) additively. \
     * It means it wouldn't apply some kind of tiling but instead it will mount each next plate iteratively
     * until the planned number of them is reached.
     * 
     * Since the board has a finite size, high values of {@link size_mid} and {@link size_deviation}
     * may lead the generation to fail. In this case, some number of additional attempts will be applied.
     * This can be adjusted via {@link attempts_max}.
     * 
     * @param _protos           limitations on types, max quantities and properties of the plates
     * @param size_mid          mean total quantity of plates to generate
     * @param size_deviation    deviation of quantity of plates to generate 
     * @param attempts_max      maximum number of attempts to generate if failed
     * @returns 
     */
    setRandom(
        _protos: PlatePrototype[],
        size_mid: number = 10,
        size_deviation: number = 2,
        attempts_max: number = 40
    ) {
        const protos = [];

        const orientations = [
            Plate.Orientations.East,
            Plate.Orientations.West,
            Plate.Orientations.North,
            Plate.Orientations.South
        ];

        for (const proto of _protos) {
            if (proto.quantity > 0) {
                protos.push({type: proto.type, properties: proto.properties, qty: proto.quantity})
            }
        }

        let remaining = size_mid + getRandomInt(-size_deviation, size_deviation);

        while (remaining > 0) {
            if (protos.length === 0) return;

            const p_index = getRandomInt(0, protos.length - 1)
            const proto = {type: protos[p_index].type, properties: protos[p_index].properties, qty: protos[p_index].qty};

            if (proto.qty === 1) {
                protos.splice(p_index, 1);
            }

            proto.qty--;

            let placed: number = null,
                attempts = 0;

            while (!placed && attempts < attempts_max) {
                let orientation = orientations[getRandomInt(0, orientations.length - 1)],
                    x = getRandomInt(0, this.__grid.dim.x-1),
                    y = getRandomInt(0, this.__grid.dim.y-1);

                placed = this.addPlate(
                    proto.type, x, y, orientation, null, proto.properties, false, true
                );

                if (placed != null) {
                    if (this.hasIntersections(placed)) {
                        this.removePlate(placed);
                        placed = null;
                    }
                }

                attempts++;
            }

            remaining--;
        }
    }

    /**
     * Checks if the plate intersects with others
     * 
     * @param plate_id ID of the plate needed to check
     * 
     * @returns whether the plate intersects with at least one another plate
     */
    hasIntersections(plate_id: number): boolean {
        const plate = this._plates[plate_id],
              {x: px0, y: py0} = plate.pos,
              plate_rels = plate.surface;

        for (const p of Object.values(this._plates)) {
            const {x: x0, y: y0} = p.pos,
                  p_rels = p.surface;

            if (p.id === plate.id) continue;

            if ((x0 === px0) && (y0 === py0)) return true;

            for (const p_rel of p_rels) {
                const {x, y} = Plate._orientXYObject(p_rel, p.state.orientation);

                if (plate_rels) {
                    for (const plate_rel of plate_rels) {
                        const {x: px, y: py} = Plate._orientXYObject(plate_rel, plate.state.orientation);

                        if ((px0 + px === x0 + x) && (py0 + py === y0 + y)) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    /**
     * Toggles editability of the plates
     * 
     * Editability means ability to select, move, rotate, delete and 
     * open the context menu of any plate in the layer.
     *
     * @param editable should the plates be editable or not
     */
    setEditable(editable=false) {
        if (editable === this._editable) {
            return;
        }

        if (editable) {
            this._setCurrentPlatesEditable(true);
            this._editable = true;
        } else {
            this._setCurrentPlatesEditable(false);
            this._editable = false;
        }
    }

    /**
     * Creates a plate from a drag-and-drop action
     * 
     * This method is intended to call as a dragging handler when user takes a plate
     * from the flyout selector menu (see {@link SelectorLayer})
     * 
     * The plate is placed in a drag-and-drop state immediately after instantation.
     * It's position adjusts to the cursor position and holds until the mouse button is released.
     * The plate created then keeps the focus, so even if there was no drag (just a single click), 
     * the plate is placed at first suitable position and remains focused (selected).
     * 
     * @param plate_data    serialized object from the plate configured in the flyout
     * @param plate_x       X position of the SVG document for the plate preview from the flyout      
     * @param plate_y       Y position of the SVG document for the plate preview from the flyout      
     * @param cursor_x      X position of the client cursor 
     * @param cursor_y      Y position of the client cursor  
     */
    takePlate(
        plate_data: SerializedPlate,
        plate_x: number,
        plate_y: number,
        cursor_x: number,
        cursor_y: number
    ) {
        const id = this.addPlateSerialized(
            plate_data.type, plate_data.position, null, plate_data.properties, false
        );

        const plate = this._plates[id];

        if (this._container.node instanceof SVGSVGElement) {
            let plate_point = getCursorPoint(this._container.node, plate_x, plate_y);

            plate.center_to_point(plate_point.x, plate_point.y);
            this._handlePlateMouseDown({which: 1, clientX: cursor_x, clientY: cursor_y}, plate);
            this.selectPlate(plate);
        } else {
            throw new Error(`${this.constructor.name}'s container is not an ${SVGSVGElement.name}`);
        }

    }

    /**
     * Creates a new plate in the layer
     *
     * @param type              plate alias
     * @param x                 X coordinate of the main cell of the plate
     * @param y                 Y coordinate of the main cell of the plate
     * @param orientation       plate orientation
     * @param id                preferred plate identifier (should be unique for different plates)
     * @param properties        custom plate properties
     * @param animate           animate plate appearance
     * @param suppress_error    log errors instead of throwing exceptions
     *
     * @returns created plate identifier
     */
    addPlate(
        type: string,
        x: number,
        y: number,
        orientation: string,
        id: number = null,
        properties: PlateProps = null,
        animate: boolean = false,
        suppress_error: boolean = false
    ): number {
        if (!(typeof x !== "undefined") || !(typeof y !== "undefined") || !orientation) {
            throw new TypeError("All of 'type', 'x', 'y', and 'orientation' arguments must be defined");
        }

        let plate_class, plate;

        // TODO: Move to separate method. Use then in setPlates().
        if (id in this._plates && this._plates[id].alias === type) {
            this._plates[id].rotate(orientation);
            return id;
        } else {
            plate_class = PlateLayer.typeToPlateClass(type);

            plate = new plate_class(this._plategroup, this.__grid, this.__schematic, this.__verbose, id, properties);
        }

        if (this._editable) {
            this._attachEventsEditable(plate);

            /// показать на плашке группу, отвечающую за информацию в состоянии редактируемости
            plate.showGroupEditable(true);

            plate.onChange((data: ChangeCallbackArg) => this._callbacks.change(data));
        }

        try {
            plate.draw(this.__grid.cell(x, y), orientation, animate);
        } catch (err) {
            if (!suppress_error) {
                console.error("Cannot draw the plate", err);
            }

            plate.dispose();

            return null;
        }

        // Move old plate with same id to prevent overwriting
        // If this plate will exist after full board refresh, it can help when debugging
        if (plate.id in this._plates) {
            const old_plate = this._plates[plate.id];
            const randpostfix = Math.floor(Math.random() * (10 ** 6));
            this._plates_old[`_old_${plate.id}_#${randpostfix}`] = old_plate;
        }

        this._plates[plate.id] = plate;

        return plate.id;
    }

    /**
     * Creates a new plate by serialized properties
     * 
     * @param type              plate alias
     * @param position          serialized plate position 
     * @param id                prefferred plate id (should be unique for different plates)
     * @param properties        custom plate properties
     * @param animate           animate plate appearance
     * @param suppress_error    log errors instead of throwing exceptions
     * 
     * @returns created plate identifier
     */
    addPlateSerialized(
        type: string,
        position: SerializedPlatePosition,
        id: number,
        properties: PlateProps,
        animate: boolean = false,
        suppress_error: boolean = false
    ): number {
        const {cell: {x, y}, orientation} = position;

        return this.addPlate(type, x, y, orientation, id, properties, animate, suppress_error);
    }

    /**
     * Displays entire composition of plates
     *
     * Creates new (provided but non-existent yet) plates,
     * updates current (provided and existing) plates,
     * removes old (existing but non-provided) plates.
     * 
     * If there are no changes at all, no events will be triggered.
     * 
     * @param plates list of plates that should be displayed at the layer 
     * 
     * @returns are there any changes in the composition
     */
    setPlates(plates: SerializedPlate[]): boolean {
        /// есть ли изменения
        let is_dirty = false;

        /// снять возможную метку с локальных плашек
        for (let plate_id of Object.keys(this._plates)) {
            this._plates[Number(plate_id)].___touched = undefined;
            this._plates[Number(plate_id)].highlightError(false);
        }

        /// выполнить основной цикл
        for (let plate of plates) {
            /// если плашки нет, пропустить итерацию
            if (!plate) continue;

            // проверить, есть ли изменения
            if (!(plate.id in this._plates)) {is_dirty = true;}

            /// ИД новой/текущей плашки
            let id;

            /// экстра-параметр может называться по-другому
            // plate.extra = plate.extra || plate.number;

            /// добавить плашку, если таковой нет
            id = this.addPlateSerialized(plate.type, plate.position, plate.id, plate.properties);

            /// если плашка создана без ошибок / существует
            if (id != null) {
                /// пометить её
                this._plates[id].___touched = true;

                /// обновить состояние
                this.setPlateState(id, {
                    input: plate.dynamic && plate.dynamic.input,
                    output: plate.dynamic && plate.dynamic.output,
                });
            }
        }

        /// удалить непомеченные плашки
        for (let plate_id in this._plates) {
            if (!this._plates[plate_id].___touched) {
                this.removePlate(Number(plate_id));

                is_dirty = true;
            }
        }

        if (is_dirty) {
            this._callbacks.change(this._plates);
        }

        return is_dirty;
    }

    /**
     * Подсветить ошибочные плашки
     *
     * @param {Array} plate_ids массив идентификаторов плашек, которые требуется подсветить
     */
    highlightPlates(plate_ids: number[]) {
        if (!plate_ids) return;

        for (let plate_id in this._plates) {
            this._plates[plate_id].highlightError(false);
        }

        for (let plate_id of plate_ids) {
            if (!(plate_id in this._plates)) {
                throw new RangeError("Plate does not exist");
            }

            this._plates[plate_id].highlightError(true);
        }
    }

    /**
     * Удалить плашку
     *
     * @param {int} id идентификатор плашки
     */
    removePlate(id: number) {
        if (typeof id === "undefined") {
            throw new TypeError("Argument 'id' must be defined");
        }

        if (!(id in this._plates)) {
            throw new TypeError(`Plate ${id} does not exist`);
        }

        let plate = this._plates[id];

        plate.dispose();

        delete this._plates[id];

        this._callbacks.change({
            id: plate.id,
            action: 'remove'
        })
    }

    /**
     * Установить состояние плашки
     *
     * @param {int}     plate_id    идентифиактор плашки
     * @param {object}  state       состояние плашки
     */
    setPlateState(plate_id: number, state: Partial<PlateState>) {
        if (!(plate_id in this._plates)) {
            console.debug('This plate does not exist', plate_id);
            return false;
        }

        let plate = this._plates[plate_id];

        plate.setState(state, true);
    }

    /**
     * Удалить все плашки со слоя
     */
    removeAllPlates() {
        for (let plate_id in this._plates) {
            this.removePlate(Number(plate_id));
        }
    }

    /**
     * Установить обработчик изменения слоя
     *
     * @param {function} cb фукнция, вызывающаяся при изменении содержимого слоя
     */
    onChange(cb: ChangeCallback) {
        if (!cb) {cb = () => {}}

        this._callbacks.change = cb;
    }

    /**
     * Установить обработчик начала перетаскивания плашки
     *
     * @param {function} cb фукнция, вызывающаяся при начале перетаскивания плашки
     */
    onDragStart(cb: () => void) {
        if (!cb) {this._callbacks.dragstart = () => {}}

        this._callbacks.dragstart = cb;
    }

    _initGroups() {
        this._clearGroups();

        this._plategroup = this._container.group();
    }

    _clearGroups() {
        if (this._plategroup) this._plategroup.remove();
    }

    /**
     * Сделать текущие плашки редактируемыми
     *
     * @param   {boolean} editable флаг, сделать редактируемыми?
     *
     * @returns {boolean} принято ли значение флага
     *
     * @private
     */
    _setCurrentPlatesEditable(editable=false) {
        if (editable === false) {
            if (this._plate_selected) {
                this._plate_selected.deselect(); // снять выделение
            }

            this._plate_selected = null;     // удалить ссылку на выделенный элемент
            // @ts-ignore
            this._container.select(`svg.${Plate.Class}`).off(); // отписать все плашки от событий

            document.removeEventListener('click', this._handleClick, false);
            document.removeEventListener('keydown', this._handleKey, false);
            document.removeEventListener('keyup',   this._handleKey, false);
            document.removeEventListener('contextmenu', this._handleContextMenu, false);

            for (let plate_id in this._plates) {
                let plate = this._plates[plate_id];

                /// скрыть на плашке группу, отвечающую за информацию в состоянии редактируемости
                plate.showGroupEditable(false);
                plate.setEditable();
            }

            return true;
        }

        for (let plate_id in this._plates) {
            let plate = this._plates[plate_id];

            /// показать на плашке группу, отвечающую за информацию в состоянии редактируемости
            plate.showGroupEditable(true);
            this._attachEventsEditable(plate);

            if (editable) {
                plate.onChange((data: ChangeCallbackArg) => this._callbacks.change(data));
            } else {
                plate.onChange(null);
            }
        }

        document.addEventListener('click', this._handleClick, false);
        document.addEventListener('keydown', this._handleKey, false);
        document.addEventListener('keyup',   this._handleKey, false);
        document.addEventListener('contextmenu', this._handleContextMenu, false);

        return true;
    }

    /**
     * Назначить внутренние обработчики событий плашки
     *
     * @param {Plate} plate плашка, события которыой необходимо будет обрабатывать
     *
     * @private
     */
    _attachEventsEditable(plate: Plate) {
        if (!plate) {
            throw new TypeError("A `plate` argument must be defined");
        }

        /// Когда на плашку нажали кнопкой мыши
        plate.container.mousedown((evt: MouseEvent) => {
            const target = evt.target as HTMLElement;

            evt.preventDefault();

            if (target.classList.contains(ContextMenu.ItemClass)) return;
            if (target.classList.contains(ContextMenu.ItemInputClass)) return;

            this.selectPlate(plate);

            if (evt.which === 1) {
                this._handlePlateMouseDown(evt, this._plate_selected);
            }
        });
    }

    selectPlate(plate: Plate) {
        /// Если плашка не была выделена ранее
        if (this._plate_selected && plate !== this._plate_selected) {
            /// Снять её выделение
            this._plate_selected.deselect();
            /// Отключить её события
            this.setPlateEditable(plate, false);
            // this._plate_selected.onChange(null);
        }

        /// Обрабатывать её события
        this.setPlateEditable(plate);
        // plate.onChange(this._callbacks.change);
        plate.onDragFinish(() => this._onPlateDragFinish(plate));
        plate.onDragStart(() => {
            this._onPlateDragStart(plate);
            this._callbacks.dragstart(plate);
        });

        /// выделить данную плашку
        this._plate_selected = plate;
        this._plate_selected.select();
    }

    /**
     * Сделать плашку редактируемой
     *
     * @param plate
     * @param editable
     *
     * @returns {boolean} принято ли изменение
     */
    setPlateEditable(plate: Plate, editable: boolean = true) {
        plate.setEditable(editable);

        if (editable) {
            plate.onMouseDown((evt: MouseEvent) => this._handlePlateMouseDown(evt, plate));
            plate.onMouseWheel((evt: WheelEvent) => this._onPlateMouseWheel(evt, plate));
        } else {
            plate.onMouseDown(null);
            plate.onMouseWheel(null);
        }
    }

    /**
     * Сгенерировать обработчик события нажатия кнопкой мыши по слою
     *
     * Если обработчик события был сгенерирован ранее, возвращается точно тот же обработчик.
     * Это можно использовать для открепления обработчика с помощью функции removeEventListener.
     *
     * @returns {function} обработчик события нажатия кнопкой мыши по слою
     *
     * @private
     */
    _handleClick(evt: MouseEvent) {
        let el = evt.target as HTMLElement;

        /// Определить, является ли элемент, по которому выполнено нажатие, частью плашки
        while ((el = el.parentElement) && !(el.classList.contains(Plate.Class))) {}

        /// Если не попали по плашке, но есть выделенная плашка
        if (!el && this._plate_selected) {
            /// Снять выделение
            this._plate_selected.deselect();

            /// Отключить её события
            this.setPlateEditable(this._plate_selected, false);
            // this._plate_selected.onChange(null);

            this._plate_selected = null;
        }
    }

    _handlePlateMouseDown(evt: PseudoMouseEvent | MouseEvent, plate: Plate) {
        if (!(this._container.node instanceof SVGSVGElement)) return;

        if (evt.which === 1 && !this._plate_dragging) {
            plate.rearrange();

            document.body.addEventListener('mousemove', this._handleMouseMove, false);
            document.body.addEventListener('mouseup', this._handleMouseUp, false);

            this._cursor_point_mousedown = getCursorPoint(this._container.node, evt.clientX, evt.clientY);

            this._plate_dragging = plate;
            this._cell_supposed = plate._calcSupposedCell();
        }
    }

    _handleMouseMove(evt: MouseEvent) {
        if (!(this._container.node instanceof SVGSVGElement)) return;

        let cursor_point = getCursorPoint(this._container.node, evt.clientX, evt.clientY);

        let dx = cursor_point.x - this._cursor_point_mousedown.x;
        let dy = cursor_point.y - this._cursor_point_mousedown.y;

        this._cursor_point_mousedown = cursor_point;

        if (dx !== 0 || dy !== 0) {
            this._plate_dragging.dmove(dx, dy);
        }
    }

    _handleMouseUp(evt: MouseEvent) {
        if (evt.which === 1) {
            document.body.removeEventListener('mousemove', this._handleMouseMove, false);
            document.body.removeEventListener('mouseup', this._handleMouseUp, false);

            // Snap & release
            this._plate_dragging.snap();
            this._plate_dragging = undefined;
        }
    }

    _onPlateMouseWheel(evt: WheelEvent, plate: Plate) {
        if (evt.deltaY > 16) {
            plate.rotateClockwise();
        }

        if (evt.deltaY < -16) {
            plate.rotateCounterClockwise();
        }
    }

    /**
     * Сгенерировать обработчик вызова контекстного меню
     *
     * @returns  {function} обработчик вызова контекстного меню
     *
     * @private
     */
    _handleContextMenu(evt: MouseEvent) {
        // ie 9+ only
        let el = evt.target as HTMLElement;

        /// Определить, является ли элемент, по которому выполнено нажатие, частью плашки
        while ((el = el.parentElement) && !(el.classList.contains(Plate.Class))) {}

        /// Если элемент является частью плашки
        if (el) {
            evt.preventDefault();
            const plate = this._plate_selected;

            const ctxmenu = plate.getCmInstance();
            this._callContextMenu(ctxmenu, {x: evt.pageX, y: evt.pageY}, [plate.state.input]);
        }
    }

    /**
     * Сгенерировать обработчик события нажатия клавиши
     *
     * Если обработчик события был сгенерирован ранее, возвращается точно тот же обработчик.
     * Это можно использовать для открепления обработчика с помощью функции removeEventListener.
     *
     * @private
     */
    _handleKey(evt: KeyboardEvent) {
        const keydown = evt.type === 'keydown';

        /// Если есть выделенная плашка
        if (this._plate_selected) {
            /// Убрать контекстное меню
            this._clearContextMenus();

            if (keydown) {
                switch (evt.code) {
                    case "Period": // >
                        this._plate_selected.inputIncrement();
                        evt.preventDefault();
                        break;
                    case "Comma": // <
                        this._plate_selected.inputDecrement();
                        evt.preventDefault();
                        break;
                    case "BracketRight":
                        this._plate_selected.rotateClockwise();
                        evt.preventDefault();
                        break;
                    case "BracketLeft":
                        this._plate_selected.rotateCounterClockwise();
                        evt.preventDefault();
                        break;
                    case "ArrowLeft":
                        this._plate_selected.shift(-1, 0);
                        evt.preventDefault();
                        break;
                    case "ArrowRight":
                        this._plate_selected.shift(1, 0);
                        evt.preventDefault();
                        break;
                    case "ArrowUp":
                        this._plate_selected.shift(0, -1);
                        evt.preventDefault();
                        break;
                    case "ArrowDown":
                        this._plate_selected.shift(0, 1);
                        evt.preventDefault();
                        break;
                    case "KeyD":
                        this._duplicatePlate(this._plate_selected);
                        evt.preventDefault();
                        break;
                    case "Delete":
                        /// Удалить её
                        this.removePlate(this._plate_selected.id);
                        this._plate_selected = null;
                        evt.preventDefault();
                        break;
                }
            }
        }

        this._plate_selected && this._plate_selected.handleKeyPress(evt.code, keydown);
    }

    /**
     * Обработать нажатие на пункт контекстного меню текущей плашки
     *
     * @param plate_id
     * @param {string} action_alias кодовое название пункта меню
     * @param value
     */
    handlePlateContextMenuItemClick(plate_id: number, action_alias: string, value: any) {
        if (!this._plates[plate_id]) return;

        const plate = this._plates[plate_id];

        switch (action_alias) {
            case PlateContextMenu.CMI_REMOVE: {
                this.removePlate(plate.id);
                break;
            }
            case PlateContextMenu.CMI_ROTCW: {
                this._plates[plate.id].rotateClockwise();
                break;
            }
            case PlateContextMenu.CMI_ROTCCW: {
                this._plates[plate.id].rotateCounterClockwise();
                break;
            }
            case PlateContextMenu.CMI_DUPLIC: {
                this._duplicatePlate(plate);
                break;
            }
            case PlateContextMenu.CMI_INPUT: {
                plate.setState({input: value});
                break;
            }
        }
    }

    /**
     * Продублировать плашку
     *
     * @param {Plate} plate исходная плашка
     * @private
     */
    _duplicatePlate(plate: Plate) {
        let new_plate_id = this.addPlate(
            plate.alias,
            plate.pos.x,
            plate.pos.y,
            plate.state.orientation,
            null,
            plate.props,
            true
        );

        this._plates[new_plate_id].setState(plate.state);

        this._plates[new_plate_id].click();
    }

    /**
     * Обработать начало перетаскивания плашки
     *
     * Все остальные плашки "замораживаются"
     *
     * @param {Plate} plate перетаскиваемая плашка
     *
     * @private
     */
    _onPlateDragStart(plate: Plate) {
        let id = String(plate.id);

        for (let pl_id in this._plates) {
            if (pl_id !== id) {
                this._plates[pl_id].freeze();
            }
        }
    }

    /**
     * Обработать конец перетаскивания плашки
     *
     * Все остальные плашки "размораживаются"
     *
     * @param {Plate} plate перетаскиваемая плашка
     *
     * @private
     */
    _onPlateDragFinish(plate: Plate) {
        let id = String(plate.id);

        for (let pl_id in this._plates) {
            if (pl_id !== id) {
                this._plates[pl_id].unfreeze();
            }
        }
    }

    /**
     * Перевести тип плашки в класс
     *
     * @param {string} type строковый тип плашки
     *
     * @returns {Plate} класс плашки
     */
    static typeToPlateClass(type: string): typeof Plate {
        if (!type) {
            throw new TypeError("Parameter `type` is not defined");
        }

        switch (type) {
            case ResistorPlate.Alias:       {return ResistorPlate}
            case PhotoresistorPlate.Alias:  {return PhotoresistorPlate}
            case RheostatPlate.Alias:       {return RheostatPlate}
            case BridgePlate.Alias:         {return BridgePlate}
            case ButtonPlate.Alias:         {return ButtonPlate}
            case SwitchPlate.Alias:         {return SwitchPlate}
            case CapacitorPlate.Alias:      {return CapacitorPlate}
            case TransistorPlate.Alias:     {return TransistorPlate}
            case InductorPlate.Alias:       {return InductorPlate}
            case RelayPlate.Alias:          {return RelayPlate}
            case DiodePlate.Alias:          {return DiodePlate}
            case BuzzerPlate.Alias:         {return BuzzerPlate}
            case MotorPlate.Alias:          {return MotorPlate}
            case RGBPlate.Alias:            {return RGBPlate}
            case DummyPlate.Alias:          {return DummyPlate}
            case UnkPlate.Alias:            {return UnkPlate}
            default:                        {throw new RangeError(`Unknown plate type '${type}'`)}
        }
    }
}
