import {ImperativeView} from "../../core/base/view/ImperativeView";
import BlocklyWrapper from '../../utils/blockly/BlocklyWrapper'

import JSONBlocks       from '../../utils/blockly/extras/blocks';
import JSONGenerators   from '../../utils/blockly/extras/generators';
import {AllProps, deferUntilMounted, IViewProps} from "../../core/base/view/View";
import {ViewEvent} from "../../core/base/Event";

export class BlocklyCodeChangeEvent extends ViewEvent<BlocklyCodeChangeEvent> {}

export interface BlocklyViewProps extends IViewProps {
    edit_limits: boolean;
    force_all_blocks: boolean;
    zoom: number;
}

export default class BlocklyView extends ImperativeView<BlocklyViewProps> {
    static defaultProps = {
        edit_limits: false,
        force_all_blocks: false,
        zoom: 0.7,
    }

    private readonly blockly: BlocklyWrapper;

    private block_types: { [p: string]: number };

    // TODO: Move to Model
    private readonly pause_duration: number;

    constructor(props: AllProps<BlocklyViewProps>) {
        super(props);

        this.blockly = new BlocklyWrapper();

        this.blockly.extra_fields = this.props.edit_limits;
        this.blockly.registerBlockTypes(JSONBlocks);
        this.blockly.registerGenerators(JSONGenerators);

        this.pause_duration = 0.2;

        this.setup();
    }

    public async inject(container: HTMLDivElement) {
        this.blockly.inject(container, false, false, this.props.zoom);

        if (this.props.force_all_blocks) {
            this.setBlockTypes(this.block_types);
        }

        this.blockly.resize();
    }

    public eject(container: HTMLDivElement): void {
        this.blockly.eject();
    }

    public getMainChain() {
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
    public getChainset() {
        let chains: any = null;

        try {
            let _handlers: any = this.blockly.getJSONHandlers();

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
            return chains;
        }

        return chains;
    }

    /**
     * Установить используемые блоки
     *
     * @param block_types массив строк с названиями типов блоков
     */
    @deferUntilMounted
    public setBlockTypes(block_types: { [block_type: string]: number }) {
       if (this.props.force_all_blocks) {
            this.blockly.updateBlockTypes(Object.keys(JSONGenerators));
        } else {
            this.blockly.updateBlockTypes(block_types);
        }
    }

    /**
     * Возвратить используемые блоки
     */
    public getBlockTypes() {
        return this.blockly.getBlockTypes();
    }

    /**
     * Подсветить блок
     *
     * Подсвеченный ранее блок гаснет.
     * Если в качестве идентификатора задать null, только гаснет подсвеченный ранее блок
     *
     * @param {string|null} block_id идентификатор блока
     */
    @deferUntilMounted
    public highlightBlock(block_id: string|null) {
        this.blockly.highlightBlock(block_id);
    }

    /**
     * Выделить ошибочные блоки
     *
     * @param {Array<string>} block_ids идентификаторы блоков
     */
    @deferUntilMounted
    public highlightErrorBlocks(block_ids: string[]) {
        for (let block_id of block_ids) {
            this.blockly.highlightErrorBlock(block_id);
        }
    }

    /**
     * Удалить выделения ошибочных блоков
     */
    @deferUntilMounted
    public clearErrorBlocks() {
        this.blockly.clearErrorBlocks();
    }

    /**
     * Установить предел количества блоков
     *
     * @param {number} [max_block_count=0] максимальное количество блоков
     */
    @deferUntilMounted
    public setBlockLimit(max_block_count=0) {
        this.blockly.updateBlockLimit(max_block_count);
    }

    /**
     * Возвратить значения полей ввода пределов количества блоков по типам
     *
     * Формат возвращаемого объекта:
     *      - ключ:     {string} тип блока
     *      - значение: {number} предел количества блоков по типу
     */
    public getBlockLimitInputsByType(): {[block_type: string]: number} {
        return this.blockly.getBlockLimitInputsByType();
    }

    /**
     * Установить значения полей ввода пределов количества блоков по типам
     *
     * @param block_counts - объект, в котором:
     *      - ключ      - тип блока
     *      - значение  - предел количества блоков по типу
     */
    @deferUntilMounted
    public setBlockLimitInputsByType(block_counts: {[block_type: string]: number}) {
        this.blockly.setBlockLimitInputsByType(block_counts);
    }

    /**
     * Получить строку с XML-кодом состояния рабочей области Blockly
     *
     * @returns {string} строка, содержащая XML-представление набранного кода
     */
    public getCodeTree(): string {
        return this.blockly.getXMLText();
    }

    public getBlockLimit(): number {
        return this.blockly.getBlockLimit();
    }

    /**
     * Задать состояние рабочей области Blockly через строку с XML-кодом
     *
     * @param text строка, содержащая XML-представление кода Blockly
     */

    @deferUntilMounted
    public setCodeTree(text?: string) {
        this.blockly.clear();

        if (text) {
            this.blockly.setXMLText(text);
        }
    }

    /**
     * Заставить Blockly генерировать дополнительные поля (для админки)
     * Работает только с wakeUp()
     *
     * @param {boolean} on генерировать ли поля
     */

    @deferUntilMounted
    public generateExtraFields(on: boolean) {
        if (this.blockly.silent) return;

        this.blockly.extra_fields = on;
    }

    @deferUntilMounted
    public lock() {
        this.blockly.lock();
    }

    @deferUntilMounted
    public unlock() {
        this.blockly.unlock();
    }

    public resize() {
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