import * as React from "react";
import {AllProps, IViewProps, View} from "../../core/base/view/View";

namespace RichTextView {
    export interface Props extends IViewProps {
        content: string;
    }

    export class RichTextView extends View<Props, undefined> {
        constructor(props: AllProps<Props>) {
            super(props);
        }

        render(): React.ReactNode {
            return (
                <div dangerouslySetInnerHTML={{ __html: this.props.content }} style={{padding: '1em'}}/>
            )
        }
    }
}

export default RichTextView;