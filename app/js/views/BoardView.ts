import {IImperativeViewProps, ImperativeView} from "../core/base/view/ImperativeView";
import Breadboard from "../utils/breadboard/Breadboard";
import {ViewEvent} from "../core/base/Event";

export class ChangeEvent extends ViewEvent<ChangeEvent> {}
export class PlateDragStartEvent extends ViewEvent<PlateDragStartEvent> {}

export default class BoardView extends ImperativeView<IImperativeViewProps> {
    private bb: Breadboard;

    constructor(props: IImperativeViewProps) {
        super(props);

        this.bb = new Breadboard();
        this.setup();
    }

    inject(container: HTMLDivElement): void {
        this.bb.inject(container, {
            readOnly: false,
        });
    }

    eject(container: HTMLDivElement): void {
        this.bb.dispose();
    }

    setReadOnly(readonly: boolean = true) {
        this.bb.setReadOnly(readonly);
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
    }
}