import IConfiguration from "../helpers/IConfiguration";
import {PaneOrientation} from "../layout/types";
import {ConfigurationError} from "../exceptions/configuration";

const UNITS_ALLOWED = [
    "px", '%'
];

export interface ILayoutPane {
    name: string,
    size: number,
    size_min: number,
    size_max: number,
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

    preprocess(): void {
        for (const mode of Object.values(this.modes)) {
            for (const pane of mode.panes) {
                LayoutConfiguration.processSizeUnits(pane);
            }

            LayoutConfiguration.validateSizes(mode.panes);
        }
    }

    static validateSizes(panes: {size?: string|number, panes?: any[]}[]) {
        const has_free = panes.some(element => !element.size);

        if (!has_free) {
            throw new ConfigurationError("Each pane should contain at least one free-sized sub-pane")
        };

        for (const pane of panes) {
            if (pane.panes) {
                this.validateSizes(pane.panes);
            }
        }
    }

    // TODO: Refactor
    static processSizeUnits(pane: ILayoutPane): void {
        if (pane.panes) {
            for (const subpane of pane.panes) {
                this.processSizeUnits(subpane);
            }
        }

        if (pane.size == null)      pane.size = 0;
        if (pane.size_min == null)  pane.size_min = 0;
        if (pane.size_max == null)  pane.size_max = 0;

        if (pane.size_min !== 0) {
            if (typeof pane.size_min === "string") {
                const matches = /^(\d+)(\D+)/gm.exec(pane.size_min);

                if (!(matches && matches.length == 3 && matches[2] == 'px')) throw new Error(`Min size should have a 'px' unit`);

                pane.size_min = Number(matches[1]);
            } else {
                throw new Error(`Min size should be a string`);
            }
        }

        if (pane.size_max !== 0) {
            if (typeof pane.size_max === "string") {
                const matches = /^(\d+)(\D+)/gm.exec(pane.size_max);

                if (!(matches && matches.length == 3 && matches[2] == 'px')) throw new Error(`Max size should have a 'px' unit`);

                pane.size_max = Number(matches[1]);
            } else {
                throw new Error(`Max size should be a string`);
            }
        }

        if (typeof pane.size === "string") {
            const matches = /^(\d+)(\D+)/gm.exec(pane.size);

            if (matches && matches.length == 3) {
                if (!(UNITS_ALLOWED.includes(matches[2]))) throw new Error(`Invalid size unit: ${matches[2]}`);

                pane.size_unit = matches[2];
                pane.size = Number(matches[1]);
            } else {
                pane.size = Number(pane.size);
            }
        } else {
            pane.size = Number(pane.size);
        }
    }
}