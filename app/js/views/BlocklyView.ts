import {IImperativeViewProps, ImperativeView} from "../core/ui/ImperativeView";
import BlocklyWrapper from '../wrappers/BlocklyWrapper'

import JSONBlocks       from '../utils/blockly/extras/blocks';
import JSONGenerators   from '../utils/blockly/extras/generators';

export default class BlocklyView extends ImperativeView<IImperativeViewProps> {
    private blockly: BlocklyWrapper;

    constructor(props: IImperativeViewProps) {
        super(props);

        this.blockly = new BlocklyWrapper();

        this.blockly.registerBlockTypes(JSONBlocks);
        this.blockly.registerGenerators(JSONGenerators);

        this.setup();
    }

    public async inject(container: HTMLDivElement) {
        this.blockly.inject(container);

        this.blockly.updateBlockTypes(JSONGenerators as Object[]);

        this.blockly.resize();
    }

    resize() {
        console.log('blk resize');
        this.blockly.resize();
    }

    eject(container: HTMLDivElement): void {
        this.blockly.eject();
    }

    private setup() {
    }
}