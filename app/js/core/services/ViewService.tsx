import * as React from "react";

import * as ReactDOM from "react-dom";
import Layout from "../views/layout/Layout";
import IViewService, {Widget} from "./interfaces/IViewService";

import ViewConnector from "../base/ViewConnector";
import {IViewProps, IViewState} from "../base/View";
import {PresenterType, ViewType} from "../base/types";

export default class ViewService extends IViewService {
    private root: Layout;

    private views: typeof React.Component[];
    private view_composer: typeof React.Component;
    private view_connector: ViewConnector;

    public setup(view_composer: typeof React.Component, views: typeof React.Component[]) {
        this.views = views;
        this.view_composer = view_composer;
        this.view_connector = new ViewConnector(this.app, []);
    }

    public compose(element: HTMLElement) {
        const view_types = this.views;

        const children = view_types.map((SpecificView: typeof React.Component, index) => {
            return <SpecificView
                connector={this.view_connector}
                key={index}
            />;
        });

        this.root = this.render(this.view_composer, children, element, null) as Layout;
    }

    public switch(mode: string) {
        this.root.setMode(mode);
    };

    public registerWidgetTypes(
        widget_types: {
            [key: string]: {
                view_type: ViewType<IViewProps, IViewState>,
                presenter_types: PresenterType<IViewProps, IViewState>[],
                label?: string
            }
        }
    ) {
        for (const [alias, widget_type] of Object.entries(widget_types)) {
            const {view_type, presenter_types, label} = widget_type;

            const connector = new ViewConnector(this.app, presenter_types);

            this.widgets.set(alias, {connector, view_type, label: label || alias} as Widget);
        }
    }

    protected render(component: typeof React.Component, children: any, target_node: any, callback: any) {
        const react_element = React.createElement(component, {}, children);
        return ReactDOM.render(react_element, target_node, callback);
    }
}