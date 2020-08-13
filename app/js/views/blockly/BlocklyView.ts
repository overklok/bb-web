import {ImperativeView} from "../../core/base/view/ImperativeView";
import BlocklyWrapper from '../../wrappers/BlocklyWrapper'

import JSONBlocks       from '../../utils/blockly/extras/blocks';
import JSONGenerators   from '../../utils/blockly/extras/generators';
import {IViewOptions, IViewProps} from "../../core/base/view/View";

export default class BlocklyView extends ImperativeView<IViewOptions> {
    private blockly: BlocklyWrapper;

    constructor(props: IViewProps<IViewOptions>) {
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
        this.blockly.resize();
    }

    eject(container: HTMLDivElement): void {
        this.blockly.eject();
    }

    private setup() {
    }
}