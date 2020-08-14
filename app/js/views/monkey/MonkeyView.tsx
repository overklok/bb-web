import * as React from "react";
import {IViewOptions, IViewState, View} from "../../core/base/view/View";

export default class MonkeyView extends View<IViewOptions, IViewState>{
    render(): React.ReactNode {
        return (
            <div className='btn'>Configure Set</div>
        )
    }
}