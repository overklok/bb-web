import * as React from "react";
import ViewComposer, {IVCProps, IVCState} from "../ViewComposer";

export default class SingleViewComposer extends ViewComposer<IVCProps, IVCState> {
    constructor(props: IVCProps) {
        super(props);
    }

    render() {
        return this.props.children ? this.props.children[0] : null;
    }
};