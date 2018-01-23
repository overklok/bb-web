import Module from '../core/Module'

import BlocklyWrapper from '../wrappers/BlocklyWrapper'
import VirtLEDWrapper from '../wrappers/VirtLEDWrapper'

/**
 * Модуль "Рабочая область"
 *
 * Предоставляет набор методов для управления интерфейсом Blockly
 */
class WorkspaceModule extends Module {
    static get eventspace_name() {return "ws"}
    static get event_types() {return []}

    constructor() {
        super();

        this._blockly  = new BlocklyWrapper();
        this._display = false;
    }

    inject(dom_node) {
        if (dom_node !== undefined) {
            this._blockly.inject(dom_node);
            this._display = true;
        }
    }

    takeout() {
        this._blockly.takeout();
        this._display = false;
    }

    resize() {
        this._blockly._onResize();
    }

    _subscribeToWrapperEvents() {
        // No events
    }
}

export default WorkspaceModule;