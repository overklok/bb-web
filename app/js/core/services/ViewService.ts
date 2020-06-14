import * as React from "react";

import * as ReactDOM from "react-dom";
import Layout from "../layout/components/Layout";
import IViewService from "./interfaces/IViewService";
import {LayoutConfig} from "../configs/LayoutConfig";
import {ViewConfig} from "../configs/ViewConfig";

export default class ViewService extends IViewService {
    private root: Layout;
    private config_layout: LayoutConfig;
    private config_view: ViewConfig;

    public setup(modes_config: LayoutConfig, views_config: ViewConfig) {
        this.config_view = views_config;
        this.config_layout = modes_config;

        this.config_layout.resolveViewAliasesToTypes(this.config_view, this.app);
    }

    public compose(element: HTMLElement) {
        const layout_props = {config: this.config_layout};
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