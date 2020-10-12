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
    static defaultOptions: BoardViewOptions = {
        schematic: true,
        readonly: true,
        verbose: false
    }

    private readonly bb: Breadboard;
    private layouts: object;
    private layout_name: string;

    constructor(props: IViewProps<BoardViewOptions>) {
        super(props);

        this.bb = new Breadboard({
            layouts: this.layouts,
            layout_name: this.layout_name
        });

        this.setup();
    }

    registerLayouts(layouts: object): void {
        if (this.bb) {
            // register immediately
            this.bb.registerLayouts(layouts);
        } else {
            // or wait till breadboard is not created
            this.layouts = layouts;
        }
    }

    inject(container: HTMLDivElement): void {
        this.bb.inject(container, {
            readOnly: this.options.readonly,
            schematic: this.options.schematic,
            detailed: this.options.schematic,
            verbose: this.options.verbose,
            layout_name: this.layout_name,
        });
    }

    eject(container: HTMLDivElement): void {
        this.bb.dispose();
    }

    setReadOnly(readonly: boolean = true) {
        this.bb.setReadOnly(readonly);
    }

    setRandom(protos: {type: string, properties: any, quantity: number}[],
          size_mid?: number,
          size_deviation?: number,
          attempts_max?: number
    ) {
        this.bb.setRandomPlates(protos, size_mid, size_deviation, attempts_max);
    }

    setLayout(layout_name: string) {
        if (this.bb) {
            this.bb.setLayout(layout_name);
        } else {
            this.layout_name = layout_name;
        }
    }

    getLayoutName() {
        return this.bb.getLayoutName();
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