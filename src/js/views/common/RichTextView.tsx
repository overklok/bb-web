import * as React from "react";
import {AllProps, IViewProps, View} from "../../core/base/view/View";

import ProcessMath from "../../utils/mathjax/ProcessMath"

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
                <ProcessMath>
                    <div dangerouslySetInnerHTML={{ __html: this.props.content }} style={{padding: '1em'}}/>
                </ProcessMath>
            )
        }
    }
}

export default RichTextView;
