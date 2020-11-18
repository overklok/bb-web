import {ImperativeView} from "../../core/base/view/ImperativeView";
import BlocklyWrapper from '../../wrappers/BlocklyWrapper'

import JSONBlocks       from '../../utils/blockly/extras/blocks';
import JSONGenerators   from '../../utils/blockly/extras/generators';
import {IViewOptions, IViewProps} from "../../core/base/view/View";
import {ViewEvent} from "../../core/base/Event";

export class BlocklyCodeChangeEvent extends ViewEvent<BlocklyCodeChangeEvent> {}

export default class BlocklyView extends ImperativeView<IViewOptions> {
    private readonly blockly: BlocklyWrapper;

    // TODO: Move to Model
    private pause_duration: number;

    constructor(props: IViewProps<IViewOptions>) {
        super(props);

        this.blockly = new BlocklyWrapper();

        this.blockly.registerBlockTypes(JSONBlocks);
        this.blockly.registerGenerators(JSONGenerators);

        this.pause_duration = 0.2;

        this.setup();
    }

    public async inject(container: HTMLDivElement) {
        this.blockly.inject(container);

        this.blockly.updateBlockTypes(JSONGenerators as Object[]);

        this.blockly.resize();
    }

    eject(container: HTMLDivElement): void {
        this.blockly.eject();
    }

    getMainChain() {
        let chains = this.blockly.getJSONHandlers();

        let code = BlocklyView.preprocessCode(chains.main);

        return {commands: code, btn: "None", pause: this.pause_duration};
    }

    /**
     * Возвратить программу
     *
     * Формат возвращаемого объекта:
     *      - ключ: `main`/ ID блока-обработчика
     *      - значение: {commands: {Array}, button: {number}}, где `commands` - JSON-код программы, `button` - код клавиши
     *
     * @returns {Object} основной код и коды обработчиков
     */
    getChainset() {
        let chains: any = null;

        try {
            let _handlers: any = this.blockly.getJSONHandlers();
            console.log(_handlers);

            let code_main = BlocklyView.preprocessCode(_handlers.main);

            chains = {main: {commands: code_main, btn: "None", pause: this.pause_duration}};

            for (let block_id of Object.keys(_handlers.sub)) {
                chains[block_id] = {
                    commands: BlocklyView.preprocessCode(_handlers.sub[block_id].code),
                    btn: _handlers.sub[block_id].btn,
                    pause: this.pause_duration
                }
            }
        } catch (err) {
            throw err;
            return chains;
        }

        return chains;
    }

    /**
     * Подсветить блок
     *
     * Подсвеченный ранее блок гаснет.
     * Если в качестве идентификатора задать null, только гаснет подсвеченный ранее блок
     *
     * @param {string|null} block_id идентификатор блока
     */
    highlightBlock(block_id: string|null) {
        this.blockly.highlightBlock(block_id);
    }

    /**
     * Выделить ошибочные блоки
     *
     * @param {Array<string>} block_ids идентификаторы блоков
     */
    highlightErrorBlocks(block_ids: string[]) {
        for (let block_id of block_ids) {
            this.blockly.highlightErrorBlock(block_id);
        }
    }

    /**
     * Удалить выделения ошибочных блоков
     */
    clearErrorBlocks() {
        this.blockly.clearErrorBlocks();
    }

    lock() {
        this.blockly.lock();
    }

    unlock() {
        this.blockly.unlock();
    }

    resize() {
        this.blockly.resize();
    }

    private setup() {
        // TODO: Throttle
        this.blockly.onChange(() => this.emit(new BlocklyCodeChangeEvent({})));
    }

    private static preprocessCode(code: string): any {
        if (!code) return [];

        code = code.trim();

        if (code.slice(-1) === ",") {
            code = code.slice(0, -1);
        }

        return JSON.parse("[" + code + "]");
    }
}