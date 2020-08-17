import {ImperativeView} from "../../core/base/view/ImperativeView";
import Breadboard from "../../utils/breadboard/Breadboard";
import {ViewEvent} from "../../core/base/Event";
import {IViewOptions, IViewProps} from "../../core/base/view/View";

export class ChangeEvent extends ViewEvent<ChangeEvent> {}
export class PlateDragStartEvent extends ViewEvent<PlateDragStartEvent> {}
export class LayoutChangeEvent extends ViewEvent<LayoutChangeEvent> {}

export interface BoardViewOptions extends IViewOptions {
    schematic?: boolean;
    verbose?: boolean;
    readonly?: boolean
}

export default class BoardView extends ImperativeView<BoardViewOptions> {
    private bb: Breadboard;

    static defaultOptions: BoardViewOptions = {
        schematic: true,
        readonly: true,
        verbose: false
    }

    constructor(props: IViewProps<BoardViewOptions>) {
        super(props);

        this.bb = new Breadboard();

        this.setup();
    }

    inject(container: HTMLDivElement): void {
        this.bb.inject(container, {
            readOnly: this.options.readonly,
            schematic: this.options.schematic,
            detailed: this.options.schematic,
            verbose: this.options.verbose,
        });
    }

    eject(container: HTMLDivElement): void {
        this.bb.dispose();
    }

    setReadOnly(readonly: boolean = true) {
        this.bb.setReadOnly(readonly);
    }

    getLayout() {
        return this.bb.getLayout();
    }

    getPlates() {
        return this.bb.getPlates();
    }

    setPlates(plates: Array<object>) {
        if (plates == null) throw new TypeError ("Plates is not defined");

        this.bb.clearRegions();

        return this.bb.setPlates(plates);
    }

    highlightErrorPlates(plate_ids: Array<string>) {
        if (!plate_ids) {return true}

        this.bb.highlightPlates(plate_ids);
    }

    setPlateState(plate_id: number, state: object) {
        this.bb.setPlateState(plate_id, state);
    }

    setCurrents(threads: Array<object>) {
        this.bb.setCurrents(threads);
    }

    highlightRegion(region: object, clear: boolean) {
        if (!region) {
            return false;
        }

        // @ts-ignore
        this.bb.highlightRegion(region.from, region.to, clear, null);
    }

    clearRegions() {
        this.bb.clearRegions();
    }

    private setup() {
        this.bb.onChange(() => this.emit(new ChangeEvent({})))
        this.bb.onDragStart(() => this.emit(new PlateDragStartEvent({})))
        this.bb.onLayoutChange(() => this.emit(new LayoutChangeEvent({})))
    }
}