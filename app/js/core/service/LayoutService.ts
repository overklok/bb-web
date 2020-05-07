import * as React from "react";
import * as ReactDOM from "react-dom";

import Layout from "../layout/components/Layout";
import ILayoutService from "./interfaces/ILayoutService";
import {LayoutConfiguration} from "../configuration/LayoutConfiguration";

export default class LayoutService implements ILayoutService {
    private root: Layout;
    private modes: LayoutConfiguration;

    public setup(modes_config: LayoutConfiguration) {
        this.modes = modes_config;
    }

    public compose(element: HTMLElement) {
        const layout_props = {config: this.modes};
        this.render(Layout, layout_props, element, null);
    }

    public setMode(mode: string) {
        this.root.setMode(mode);
    }

    protected render(component: any, props: any, target_node: any, callback: any) {
        const react_element = React.createElement(component, props, null);
        this.root = ReactDOM.render(react_element, target_node, callback) as Layout;

        return react_element;
    }
}