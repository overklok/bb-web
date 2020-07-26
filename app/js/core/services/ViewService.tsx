import * as React from "react";

import * as ReactDOM from "react-dom";
import IViewService, {Widget, WidgetType} from "./interfaces/IViewService";

import ViewConnector from "../base/ViewConnector";
import {ViewComposerAny, ViewComposerType} from "../helpers/types";

export default class ViewService extends IViewService {
    private composer_instance: ViewComposerAny;

    private element: HTMLElement;

    private view_composer: typeof React.Component;

    public setup(view_composer: ViewComposerType<any, any>, widget_types: string | WidgetType[] = []) {
        this.widgets = {};
        this.view_composer = view_composer;

        if (typeof widget_types === 'string') {
            this.widget_type_key = widget_types;
        } else {
            this.widget_types = widget_types;
        }
    }

    public compose(element: HTMLElement) {
        this.element = element;

        this.recompose();
    }

    public registerWidgetTypes(widget_types: {[key: string]: WidgetType}) {
        for (const [alias, widget_type] of Object.entries(widget_types)) {
            const {view_type, presenter_types, label} = widget_type;

            const connector = new ViewConnector(this.app, presenter_types);

            this.widgets[alias] = {connector, view_type, label: label || alias} as Widget;
        }

        if (this.widget_type_key) {
            if (!(this.widget_type_key in this.widgets)) {
                throw new Error(`Widget type ${this.widget_type_key} has not been found`);
            }
            this.widget_types = [widget_types[this.widget_type_key]];
        }

        if (this.element) {
            this.recompose();
        }
    }

    protected recompose() {
        if (!this.element) {throw new Error("Root view hasn't been composed yet")};

        const children = this.widget_types.map((widget_type: WidgetType, index) => {
            const {view_type: SpecificView, presenter_types} = widget_type;

            const view_connector = new ViewConnector(this.app, presenter_types);

            return <SpecificView
                widgets={this.widgets}
                connector={view_connector}
                key={index}
            />;
        });

        this.composer_instance = this.render(this.view_composer, children, this.element, null) as ViewComposerAny;
    }

    protected render(component: typeof React.Component, children: any, target_node: any, callback: any) {
        const react_element = React.createElement(component, {}, children);
        return ReactDOM.render(react_element, target_node, callback);
    }
}