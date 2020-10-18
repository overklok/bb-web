import * as React from "react";

import * as ReactDOM from "react-dom";
import IViewService, {Widget, WidgetType} from "./interfaces/IViewService";

import ViewConnector from "../base/ViewConnector";
import {ViewComposerAny, ViewComposerType} from "../helpers/types";
import Nest from "../base/view/Nest";
import {getClassNameAlias} from "../helpers/functions";
import IEventService from "./interfaces/IEventService";
import IModelService from "./interfaces/IModelService";
import Application from "../Application";

export default class ViewService extends IViewService {
    private composer_instance: ViewComposerAny;

    private element: HTMLElement;

    private view_composer: typeof React.Component;

    private view_connectors_internal: ViewConnector[] = [];
    private view_connectors_external: [string, ViewConnector][] = [];
    private svc_event: IEventService;
    private svc_model: IModelService;

    constructor(app: Application) {
        super(app);

        this.widgets = {};
        this.widget_types = [];
    }

    public setup(view_composer: ViewComposerType<any, any>, widget_types: string | WidgetType<any>[] = []) {
        this.widgets = {};
        this.view_composer = view_composer;

        this.svc_event = this.app.instance(IEventService);
        this.svc_model = this.app.instance(IModelService);

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

    public registerWidgetTypes(widget_types: {[key: string]: WidgetType<any>}) {
        for (const [alias, widget_type] of Object.entries(widget_types)) {
            const {view_type, presenter_types, label, view_options} = widget_type;

            const connector = new ViewConnector(this.svc_event, this.svc_model, presenter_types);

            this.view_connectors_external.push([alias, connector]);

            this.widgets[alias] = {connector, view_type, label: label || alias, view_options} as Widget<any>;
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

    /**
     * Get views currently attached
     */
    public getViews(): {[name: string]: any} {
        const views: {[name: string]: any} = {};

        for (const connector of this.view_connectors_internal) {
            if (connector.view) {
                const view_name = connector.view.constructor.name;
                const view_alias = getClassNameAlias(view_name, 'View');

                views[view_alias] = connector.view;
            }
        }

        for (const [alias, connector] of this.view_connectors_external) {
            if (connector.view) {
                views[alias] = connector.view;
            }
        }

        return views;
    }

    protected recompose() {
        if (!this.element) {throw new Error("Root view hasn't been composed yet")};

        this.view_connectors_internal = [];

        const children = this.widget_types.map((widget_type: WidgetType<any>, index) => {
            const {view_type: SpecificView, presenter_types, label, view_options} = widget_type;

            const view_connector = new ViewConnector(this.svc_event, this.svc_model, presenter_types);

            this.view_connectors_internal.push(view_connector);

            return <Nest
                key={index}
                index={index}
                view_type={SpecificView}
                view_options={view_options}
                connector={view_connector}
                widgets={this.widgets}
                label={label}
            />;
        });

        this.composer_instance = this.render(this.view_composer, children, this.element, null) as ViewComposerAny;
    }

    protected render(component: typeof React.Component, children: any, target_node: any, callback: any) {
        const react_element = React.createElement(component, {}, children);
        return ReactDOM.render(react_element, target_node, callback);
    }
}