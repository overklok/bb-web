import * as React from "react";
import * as ReactDOM from "react-dom";
import i18next from "i18next";

import IViewService, {Widget, WidgetType} from "./interfaces/IViewService";

import Application from "../Application";
import ViewConnector from "../base/ViewConnector";
import IEventService from "./interfaces/IEventService";
import IModelService from "./interfaces/IModelService";
import IRoutingService from "./interfaces/IRoutingService";
import {ViewComposerAny, ViewComposerType} from "../helpers/types";
import {getClassNameAlias} from "../helpers/functions";
import Nest from "../base/view/Nest";

/**
 * React-based implementation of View layer inside MVP pattern
 * 
 * @inheritdoc
 * 
 * @category Core
 * @subcategory Service
 */
export default class ViewService extends IViewService {
    /** HTML node where root widgets will be deployed to */
    private element: HTMLElement;

    /** {@link ViewComposer} to use if there are multiple root widgets defined */
    private view_composer: typeof React.Component;

    /** 
     * unique string identifiers for root widgets, 
     * will be generated automatically if root widgets 
     * are defined as array 
     */
    private root_widgets_aliases: string[] = [];

    /** an instance of event service, required to instantiate {@link ViewComposer} */
    private svc_event: IEventService;
    /** an instance of model service, required to instantiate {@link ViewComposer} */
    private svc_model: IModelService;
    /** an instance of routing service, used to instantiate {@link ViewComposer} */
    private svc_routing: IRoutingService;

    /**
     * @inheritdoc
     */
    constructor(app: Application) {
        super(app);

        this.widgets = {};
        this.root_widget_types = [];
    }

    /**
     * @inheritdoc
     */
    public setup() {
        this.widgets = {};

        this.svc_event = this.app.instance(IEventService);
        this.svc_model = this.app.instance(IModelService);
        this.svc_routing = this.app.instance(IRoutingService, false);
    }

    /**
     * @inheritdoc
     */
    public compose(element: HTMLElement) {
        this.element = element;

        this.recompose(i18next.language);

        // FIXME: For non-SPA apps, this changes all instances' language simultaneously
        i18next.on('languageChanged', lang => {
            this.recompose(lang);
        })
    }

    /**
     * @inheritdoc
     */
    public setRootWidgets(view_composer: ViewComposerType<any, any>, widget_types: string | WidgetType<any>[] = []) {
        this.widgets = {};
        this.view_composer = view_composer;
        this.root_widget_types = [];

        if (typeof widget_types === 'string') {
            this.root_widgets_aliases = [widget_types];
        } else {
            this.root_widget_types = widget_types;
        }
    }

    /**
     * @inheritdoc
     */
    public registerWidgetTypes(widget_types: {[key: string]: WidgetType<any>}) {
        for (const [alias, widget_type] of this.allWidgetTypes(widget_types)) {
            const {view_type, presenter_types, label, view_props, nest_style} = widget_type;

            const connector = new ViewConnector(
                presenter_types, 
                this.svc_event, 
                this.svc_model, 
                this.svc_routing
            );

            this.widgets[alias] = {
                label: label || alias,
                alias,
                view_type,
                connector,
                view_props,
                nest_style
            } as Widget<any>;
        }

        if (this.element) {
            this.recompose(i18next.language);
        }
    }

    /**
     * @inheritdoc
     */
    public getViews(): {[name: string]: any} {
        const views: {[name: string]: any} = {};

        for (const widget of Object.values(this.widgets)) {
            if (widget.connector.view) {
                let view_alias = (widget.connector.view as any).__proto__.constructor.alias;

                if (!view_alias) {
                    const view_name = widget.connector.view.constructor.name;
                    view_alias = getClassNameAlias(view_name, 'View');
                }

                views[view_alias] = widget.connector.view;
            }
        }

        return views;
    }

    /**
     * Renders root {@link ViewComposer} to root element with {@link Nest}s containing root widgets 
     */
    protected async recompose(lang: string) {
        if (!this.element) {throw new Error("Root view hasn't been composed yet")};

        const children = [];

        for (const widget of this.rootWidgets()) {
            const {view_type: SpecificView, connector, view_props} = widget;

            children.push(
                <Nest
                    key={widget.alias}
                    lang={lang}
                    view_type={SpecificView}
                    view_props={view_props}
                    connector={connector}
                    widgets={this.widgets}
                />
            );
        };

        await this.render(this.view_composer, children, this.element, null) as ViewComposerAny;
    }

    /**
     * Initializes virtual DOM linked with given HTML element
     * 
     * @param component     component to render
     * @param children      contents of the component
     * @param target_node   HTML node to generate the DOM tree inside
     * @param callback      function to call when the component is rendered
     */
    protected async render(component: typeof React.Component, 
                           children: any, 
                           target_node: HTMLElement, 
                           callback: any
                           ) {
        return new Promise(resolve => {
            // const refCallback = (ref: any) => {
            //     target_node.appendChild(ref);
            //     resolve(ref);
            // }

            // const react_element = React.createElement(component, {refCallback} as any, children);
            const react_element = React.createElement(component, {}, children);
            ReactDOM.render(react_element, target_node, callback);
        });
    }

    /**
     * Generates overall list of generated root widgets, 
     * registered via either {@link WidgetType} array or 
     * alias reference 
     * 
     * {@see registerWidgetTypes}
     */
    protected* rootWidgets() {
        for (const alias of this.root_widgets_aliases) {
            const widget = this.widgets[alias];

            if (!widget) throw Error(`Widget ${alias} is not found`);

            yield widget;
        }

        for (const [alias, widget] of Object.entries(this.widgets)) {
            if (alias.startsWith('__root')) {
                yield widget;
            }
        }
    }

    /**
     * Generates overall list of widget types (both root and local)
     * 
     * This is a utility generator to simplify other parts of the code.
     * Root widgets aliases will be generated for convenience.
     * 
     * @param local_widget_types key-valued object of widget types to combine with the root widget types
     */
    protected* allWidgetTypes(local_widget_types: {[key: string]: WidgetType<any>}): Generator<[string, WidgetType<any>]> {
        let root_num = 0;

        for (const widget_type of this.root_widget_types) {
            yield [`__root${root_num++}`, widget_type];
        }

        for (const [alias, widget_type] of Object.entries(local_widget_types)) {
            yield [alias, widget_type];
        }
    }
}