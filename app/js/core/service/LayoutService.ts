import * as React from "react";

import * as ReactDOM from "react-dom";
import Layout from "../layout/components/Layout";
import ILayoutService from "./interfaces/ILayoutService";
import {ILayoutMode, ILayoutPane, LayoutConfig} from "../configs/LayoutConfig";
import {ViewConfig} from "../configs/ViewConfig";

export default class LayoutService implements ILayoutService {
    private root: Layout;
    private config: LayoutConfig;
    private viewconfig: ViewConfig;

    public setup(modes_config: LayoutConfig, views_config: ViewConfig) {
        this.viewconfig = views_config;
        this.config = modes_config;

        this.config.resolveViewAliasesToTypes(this.viewconfig);
    }

    public compose(element: HTMLElement) {
        const layout_props = {config: this.config};
        this.root = this.render(Layout, layout_props, element, null) as Layout;
    }

    public switch(mode: string) {
        this.root.setMode(mode);
    };

    protected render(component: typeof React.Component, props: any, target_node: any, callback: any) {
        const react_element = React.createElement(component, props, null);
        return ReactDOM.render(react_element, target_node, callback);
    }
}