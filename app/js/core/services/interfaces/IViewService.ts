import Application from "../../Application";
import * as React from "react";
import ViewConnector from "../../base/ViewConnector";
import {IViewProps, IViewState, View} from "../../base/View";
import {PresenterType, ViewType} from "../../helpers/types";

export type Widget = {connector: ViewConnector, view_type: typeof View, label?: string};

/**
 * @abstract
 */
export default class IViewService {
    protected readonly app: Application;
    protected widgets: {[key: string]: Widget};

    constructor(app: Application) {
        this.app = app;
        this.widgets = {};
    }

    public setup(view_composer: typeof React.Component, views: typeof React.Component[])  {throw new Error('abstract')};
    public compose(element: HTMLElement)                                                  {throw new Error('abstract')};
    public switch(mode: string)                                                           {throw new Error('abstract')};
    public registerWidgetTypes(
        widget_types: {
            [key: string]: {
                view_type: ViewType<IViewProps, IViewState>,
                presenter_types: PresenterType<IViewProps, IViewState>[],
                label?: string
            }
        }
    )                                                                                     {throw new Error('abstract')};
}