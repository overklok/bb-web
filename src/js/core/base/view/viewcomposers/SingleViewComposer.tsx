import * as React from "react";
import ViewComposer, {IVCProps, IVCState} from "../ViewComposer";

/**
 * Displays only first {@link View} in the collection
 * 
 * @category Core
 * @subcategory View
 * 
 * @component
 */
export default class SingleViewComposer extends ViewComposer<IVCProps, IVCState> {
    constructor(props: IVCProps) {
        super(props);
    }

    render() {
        return (
            // <div ref={this.props.refCallback}>
                this.props.children ? this.props.children[0] : null
            // </div>
        )
    }
};