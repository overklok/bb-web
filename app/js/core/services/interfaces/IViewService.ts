import Application from "../../Application";
import ViewConnector from "../../base/ViewConnector";
import {IViewProps, IViewState, View} from "../../base/view/View";
import {PresenterType, ViewComposerType, ViewType} from "../../helpers/types";

export type Widget<P extends IViewProps> = {
    connector: ViewConnector,
    view_type: ViewType<P, any>,
    view_props?: P,
    label?: string
};

export type WidgetType<P extends IViewProps> = {
    view_type: ViewType<P, IViewState>;
    presenter_types: PresenterType<View<P>>[];
    view_props?: P;
    label?: string;
};

/**
 * @abstract
 */
export default class IViewService {
    protected readonly app: Application;
    protected widgets: {[key: string]: Widget<any>};
    protected widget_types: WidgetType<any>[];
    protected widget_type_key: string;

    constructor(app: Application) {
        this.app = app;
    }

    public setup() {
        throw new Error('abstract');
    };

    public compose(element: HTMLElement) {
        throw new Error('abstract');
    };

    public setRootWidgets(view_composer: ViewComposerType<any, any>, widget_types: string | WidgetType<any>[]) {
        throw new Error('abstract');
    };

    public registerWidgetTypes(widget_types: {[key: string]: WidgetType<any>}) {
        throw new Error('abstract');
    };

    public getViews(): { [name: string]: any } {
        throw new Error('abstract');
    };
}