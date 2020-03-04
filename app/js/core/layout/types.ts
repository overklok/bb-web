import IConfiguration from "../helpers/IConfiguration";

export enum PaneOrientation {
    Vertical = 'vertical',
    Horizontal = 'horizontal'
}

export interface ILayoutPane {
    name: string,
    size: number,
    panes: ILayoutPane[];
}

export interface ILayoutMode {
    panes: ILayoutPane[];
    policy: PaneOrientation;
}

export class LayoutConfiguration implements IConfiguration {
    modes: {[key: string]: ILayoutMode};
}