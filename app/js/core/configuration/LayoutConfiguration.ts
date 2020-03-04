import IConfiguration from "../helpers/IConfiguration";
import {PaneOrientation} from "../layout/types";

const UNITS_ALLOWED = [
    "px", '%'
];

export interface ILayoutPane {
    name: string,
    size: number,
    size_unit: string;
    panes: ILayoutPane[];
}

export interface ILayoutMode {
    panes: ILayoutPane[];
    policy: PaneOrientation;
}

export class LayoutConfiguration implements IConfiguration {
    modes: {[key: string]: ILayoutMode};

    constructor(config: object) {
        this.modes = {};

        for (const [mode_name, mode] of Object.entries(config)) {
            this.modes[mode_name] = <ILayoutMode>mode;
        }
    }

    preprocess (): void {
        for (const mode of Object.values(this.modes)) {
            for (const pane of mode.panes) {
                this.processSizeUnits(pane);
            }
        }
    }

    // TODO: Refactor
    processSizeUnits(pane: ILayoutPane): void {
        if (pane.panes) {
            for (const subpane of pane.panes) {
                this.processSizeUnits(subpane);
            }
        }

        if (pane.size == null) return;

        if (typeof pane.size === "string") {
            const matches = /^(\d+)(\D+)/gm.exec(pane.size);

            if (matches.length == 3) {
                if (!(matches[2] in UNITS_ALLOWED)) throw new Error(`Invalid size unit: ${matches[2]}`);

                pane.size_unit = matches[2];
                pane.size = Number(matches[1]);
            } else {
                pane.size_unit = "px";
                pane.size = Number(pane.size);
            }
        } else {
            pane.size_unit = "px";
            pane.size = Number(pane.size);
        }
    }
}