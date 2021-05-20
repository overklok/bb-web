import * as React from "react";
import {AllProps, IViewProps, View} from "../../core/base/view/View";

require('../../../css/blocks/generic/kbdlist.less');

namespace KeyboardView {
    export interface Props extends IViewProps {
        buttons: [string, boolean][];
    }

    export class KeyboardView extends View<Props, undefined> {
        static defaultProps: Props = {
            buttons: []
        }

        constructor(props: AllProps<Props>) {
            super(props);
        }

        render(): React.ReactNode {
            return (
                <ul className='kbdlist'>
                    {this.props.buttons.map(([button, is_correct], i) => {
                        let color = 'default';

                        if (is_correct === true) color = 'success';
                        if (is_correct === false) color = 'danger';

                        return <li className={`kbdlist__item kbdlist__item_${color}`} key={i}>{button}</li>
                    })}
                </ul>
            )
        }
    }
}

export default KeyboardView;