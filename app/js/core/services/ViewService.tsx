import * as React from "react";

import * as ReactDOM from "react-dom";
import IViewService, {Widget} from "./interfaces/IViewService";

import ViewConnector from "../base/ViewConnector";
import {IViewProps, IViewState} from "../base/View";
import {PresenterType, ViewComposerAny, ViewType} from "../helpers/types";

export default class ViewService extends IViewService {
    private composer_instance: ViewComposerAny;

    private element: HTMLElement;

    private views: typeof React.Component[];
    private view_composer: typeof React.Component;
    private view_connector: ViewConnector;

    public setup(view_composer: typeof React.Component, views: typeof React.Component[]) {
        this.views = views;
        this.view_composer = view_composer;
        this.view_connector = new ViewConnector(this.app, []);
    }

    public compose(element: HTMLElement) {
        this.element = element;

        this.recompose();
    }

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

            this.widgets[alias] = {connector, view_type, label: label || alias} as Widget;
        }

        if (this.element) {
            this.recompose();
        }
    }

    protected recompose() {
        if (!this.element) {throw new Error("Root view hasn't been composed yet")};

        const view_types = this.views;

        const children = view_types.map((SpecificView: typeof React.Component, index) => {
            return <SpecificView
                connector={this.view_connector}
                key={index}
            />;
        });

        const props = {
            widgets: this.widgets
        };

        this.composer_instance = this.render(this.view_composer, props, children, this.element, null) as ViewComposerAny;
    }

    protected render(component: typeof React.Component, props: any, children: any, target_node: any, callback: any) {
        const react_element = React.createElement(component, props, children);
        return ReactDOM.render(react_element, target_node, callback);
    }
}