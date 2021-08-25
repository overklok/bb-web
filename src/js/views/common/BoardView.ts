import {ImperativeView} from "../../core/base/view/ImperativeView";
import Breadboard from "../../utils/breadboard/Breadboard";
import {ViewEvent} from "../../core/base/Event";
import {AllProps, deferUntilMounted, IViewProps, IViewState} from "../../core/base/view/View";
import {Layout} from "../../utils/breadboard/core/types";
import { Thread } from "~/js/models/common/BoardModel";

namespace BoardView {
    export class PlateDragStartEvent extends ViewEvent<PlateDragStartEvent> {}
    export class ShortCircuitStartEvent extends ViewEvent<ShortCircuitStartEvent> {}
    export class ShortCircuitEndEvent extends ViewEvent<ShortCircuitEndEvent> {}
    export class LayoutChangeEvent extends ViewEvent<LayoutChangeEvent> {layout_name: string}
    export class BoardChangeEvent extends ViewEvent<BoardChangeEvent> {plates: any[]}

    export interface BoardViewProps extends IViewProps {
        schematic?: boolean;
        verbose?: boolean;
        readonly?: boolean;
        debug?: boolean;
        layouts: {[name: string]: Layout};
        layout_name: string;
    }

    export class BoardView extends ImperativeView<BoardViewProps> {
        static defaultProps: BoardViewProps = {
            schematic: true,
            readonly: true,
            verbose: false,
            debug: false,
            layouts: {},
            layout_name: 'v5x'
        }

        private readonly bb: Breadboard;

        constructor(props: AllProps<BoardViewProps>) {
            super(props);

            this.bb = new Breadboard({
                layouts: this.props.layouts,
                layout_name: this.props.layout_name
            });

            this.bb.registerLayouts(this.props.layouts);

            this.setup();
        }

        inject(container: HTMLDivElement): void {
            this.bb.inject(container, {
                readOnly: this.props.readonly,
                schematic: this.props.schematic,
                detailed: this.props.schematic,
                verbose: this.props.verbose,
                debug: this.props.debug,
                layout_name: this.props.layout_name,
            });
        }

        eject(container: HTMLDivElement): void {
            this.bb.dispose();
        }

        @deferUntilMounted
        setReadOnly(readonly: boolean = true) {
            this.bb.setReadOnly(readonly);
        }

        @deferUntilMounted
        setVerbose(verbose: boolean = true) {
            this.bb.switchVerbose(verbose);
        }

        @deferUntilMounted
        setDebug(debug: boolean = true) {
            this.bb.switchDebug(debug);
        }

        @deferUntilMounted
        setRandom(protos: { type: string, properties: any, quantity: number }[],
                  size_mid?: number,
                  size_deviation?: number,
                  attempts_max?: number
        ) {
            this.bb.setRandomPlates(protos, size_mid, size_deviation, attempts_max);
        }

        setLayout(layout_name: string) {
            // if (this.bb) {
            //     this.bb.setLayout(layout_name);
            // } else {
            //     this.layout_name = layout_name;
            // }
        }

        /**
         * @deprecated
         */
        getPlates() {
            return this.bb.getPlates();
        }

        @deferUntilMounted
        setPlates(plates: object[]) {
            if (plates == null) throw new TypeError("Plates is not defined");

            this.bb.clearRegions();

            return this.bb.setPlates(plates);
        }

        @deferUntilMounted
        highlightErrorPlates(plate_ids: number[]) {
            if (!plate_ids) {
                return true
            }

            this.bb.highlightPlates(plate_ids);
        }

        @deferUntilMounted
        setPlateState(plate_id: number, state: object) {
            this.bb.setPlateState(plate_id, state);
        }

        @deferUntilMounted
        setCurrents(threads: Thread[]) {
            this.bb.setCurrents(threads);
        }

        @deferUntilMounted
        setPinsValues(values: ["input"|"output", number][]) {
            this.bb.setPinsValues(values)
        }

        @deferUntilMounted
        highlightRegion(region: object, clear: boolean) {
            if (!region) {
                return false;
            }

            // @ts-ignore
            this.bb.highlightRegion(region.from, region.to, clear, null);
        }

        @deferUntilMounted
        clearRegions() {
            this.bb.clearRegions();
        }

        render(): React.ReactNode {
            return super.render();
        }

        private setup() {
            this.bb.onDragStart(() => this.emit(new PlateDragStartEvent({})));
            this.bb.onChange(() => this.emit(new BoardChangeEvent({plates: this.bb.getPlates()})));
            this.bb.onLayoutChange((layout_name: string) => this.emit(new LayoutChangeEvent({layout_name})));
            this.bb.onShortCircuitStart(() => this.emit(new ShortCircuitStartEvent({})));
            this.bb.onShortCircuitEnd(() => this.emit(new ShortCircuitEndEvent({})));
        }
    }
}

export default BoardView;
