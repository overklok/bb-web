import Application from "../../Application";
import * as React from "react";
import {IViewProps, View} from "../../ui/View";

/**
 * @abstract
 */
export default class IViewService {
    protected readonly app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    public setup(view_composer: typeof React.Component, views: typeof React.Component[])   {throw new Error('abstract')};
    public compose(element: HTMLElement)                                        {throw new Error('abstract')};
    public switch(mode: string)                                                 {throw new Error('abstract')};
}