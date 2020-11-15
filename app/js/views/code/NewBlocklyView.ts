import {ImperativeView} from "../../core/base/view/ImperativeView";
import NewBlocklyWrapper from '../../wrappers/NewBlocklyWrapper';

import {IViewOptions, IViewProps} from "../../core/base/view/View";
import {ViewEvent} from "../../core/base/Event";

export class BlocklyCodeChangeEvent extends ViewEvent<BlocklyCodeChangeEvent> {}

export default class NewBlocklyView extends ImperativeView<IViewOptions> {
    private readonly blockly: NewBlocklyWrapper;

    constructor(props: IViewProps<IViewOptions>) {
        super(props);

        this.blockly = new NewBlocklyWrapper();
    }

    public async inject(container: HTMLDivElement) {
        this.blockly.inject(container);
        this.blockly.resize();
    }

    eject(container: HTMLDivElement): void {
        this.blockly.eject();
    }
}