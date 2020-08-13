import * as React from "react";
import ViewComposer, {IVCProps, IVCState} from "../ViewComposer";
import classNames from "classnames";

export default class OverlayViewComposer extends ViewComposer<IVCProps, IVCState> {
    constructor(props: IVCProps) {
        super(props);
    }

    render() {
        return this.props.children.map((child, i) => {
            const klasses = classNames({
                'layer': true,
            });

            return <div key={i} className={klasses}>
                {child}
            </div>
        });
    }
};