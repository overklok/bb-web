import * as React from "react";
import {AllProps, IViewProps, View} from "../../core/base/view/View";

export namespace RichTextView {
    export interface Props extends IViewProps {
        content: string;
    }

    export class RichTextView extends View<Props, undefined> {
        constructor(props: AllProps<Props>) {
            super(props);
        }

        render(): React.ReactNode {
            return (
                <div dangerouslySetInnerHTML={{ __html: this.props.content }} />
            )
        }
    }
}