import * as React from "react";

import * as ReactDOM from "react-dom";
import Layout from "../layout/components/Layout";
import IViewService from "./interfaces/IViewService";
import {LayoutConfig} from "../configs/LayoutConfig";
import {ViewConfig} from "../configs/ViewConfig";
import Presenter from "../base/Presenter";
import {View} from "../base/View";
import ViewConnector from "../helpers/containers/ViewConnector";

export default class ViewService extends IViewService {
    private root: Layout;
    private config: LayoutConfig;
    private viewconfig: ViewConfig;
    private connectors: Map<typeof View, ViewConnector> = new Map();

    public setup(modes_config: LayoutConfig, views_config: ViewConfig) {
        this.viewconfig = views_config;
        this.config = modes_config;

        this.config.resolveViewAliasesToTypes(this.viewconfig);
    }

    public registerPresenterType(presenter: typeof Presenter): void {
        if (this.connectors.get(presenter.viewtype) == null) {
            this.connectors.set(presenter.viewtype, new ViewConnector(this.app));
        }

        this.connectors.get(presenter.viewtype).addPresenter(presenter);
    }

    public getViewConnector(viewtype: typeof View): ViewConnector {
        const connector = this.connectors.get(viewtype);

        return connector || new ViewConnector(this.app);
    }

    public compose(element: HTMLElement) {
        const layout_props = {config: this.config, svc_view: this};
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