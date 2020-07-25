import * as React from "react";

import * as ReactDOM from "react-dom";
import Layout from "../views/layout/Layout";
import IViewService from "./interfaces/IViewService";

import ViewConnector from "../ui/ViewConnector";

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

    protected render(component: typeof React.Component, children: any, target_node: any, callback: any) {
        const react_element = React.createElement(component, {}, children);
        return ReactDOM.render(react_element, target_node, callback);
    }
}