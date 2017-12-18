import Module from '../core/Module.js'

import BlocklyWrapper from '../wrappers/BlocklyWrapper'
import VirtLEDWrapper from '../wrappers/VirtLEDWrapper'

/**
 * Модуль "Рабочая область"
 *
 * Предоставляет набор методов для управления содержимым, отображаемым на странице:
 *      - Список уровней
 *      - Виртуальная гирлянда
 */
class WorkspaceModule extends Module {
    static get eventspace_name() {return "ws"}

    constructor() {
        super();

        this.blockly  = new BlocklyWrapper();
        this.virt_led = new VirtLEDWrapper();
    }
}

export default WorkspaceModule;