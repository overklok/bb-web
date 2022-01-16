import Application from "../../Application";
import ViewConnector from "../../base/ViewConnector";
import {IViewProps, IViewState, View} from "../../base/view/View";
import {PresenterType, ViewComposerType, ViewType} from "../../helpers/types";
import {CSSProperties} from "react";
import { NotImplementedError } from "../../helpers/exceptions/notimplemented";

/**
 * Data structure that contains all stuff
 * required to deploy the View and connect it 
 * to other components of the application
 * 
 * @category Core
 */
export type Widget<P extends IViewProps> = {
    connector: ViewConnector,
    view_type: ViewType<P, any>,
    view_props?: P,
    nest_style?: CSSProperties,
    label?: string,
    alias: string
};

/**
 * Description of a {@link Widget}
 * 
 * @category Core
 */
export type WidgetType<P extends IViewProps> = {
    view_type: ViewType<P, IViewState>;
    presenter_types: PresenterType<View<P>>[];
    view_props?: P;
    nest_style?: CSSProperties;
    label?: string;
};

/**
 * MVP's View layer interface
 * 
 * Note that it's defined as a class just to keep it available in runtime.
 * 
 * @abstract
 * 
 * @category Core
 * @subcategory Service
 */
export default class IViewService {
    /** an instance of application (TODO: App instance should not be available here. Move all dependencies to the constructor signature) */
    protected readonly app: Application;
    /** all registered widget instances keyed by their aliases */
    protected widgets: {[key: string]: Widget<any>};
    /** list of root widget types to use in application */
    protected root_widget_types: WidgetType<any>[];
    /** root widget alias to use in application  */
    protected widget_type_key: string;

    /**
     * Instantiates the service
     * 
     * @param app instance of the application that loaded the service
     */
    constructor(app: Application) {
        this.app = app;
    }

    /**
     * Resolves external dependenies from the application
     * 
     * TODO: Pass external depenencies from 'this.app' here
     */
    public setup() {
        throw new NotImplementedError('abstract');
    };

    /**
     * Mounts DOM tree to the given element
     * 
     * Creates {@link View}s by instantiating {@link ViewComposer}s.
     * 
     * @param element root element to mount to
     */
    public compose(element: HTMLElement) {
        throw new NotImplementedError('abstract');
    };

    /**
     * Defines root widgets to display
     * 
     * This function is required to call because the service should
     * know what to display at the root of tree.
     * 
     * This function should be called before {@link registerWidgetTypes}.
     * It's possible to do from either {@link Application.setup} or {@link Application.run},
     * but the former one is more preferred.
     * 
     * If the function is called multiple times, only the last call will be considered.
     * 
     * @param view_composer type of {@link ViewComposer} to compose multiple widgets 
     * @param widget_types  types of widgets to compose
     */
    public setRootWidgets(view_composer: ViewComposerType<any, any>, widget_types: string | WidgetType<any>[]) {
        throw new NotImplementedError('abstract');
    };

    /**
     * Registers widget types to resolve them dynamically in runtime
     * 
     * @param widget_types types of widgets required in the app
     */
    public registerWidgetTypes(widget_types: {[key: string]: WidgetType<any>}) {
        throw new NotImplementedError('abstract');
    };

    /**
     * @returns alias-keyed dictionary of {@link View}s created by the service
     */
    public getViews(): { [name: string]: any } {
        throw new NotImplementedError('abstract');
    };
}