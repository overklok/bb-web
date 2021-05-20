import * as React from "react";
import {AllProps, IViewProps, View} from "../../core/base/view/View";
import classNames from "classnames";

require("../../../css/blocks/variables.less");

export namespace VariableView {
    interface Variable {
        name: string;
        type: string;
        value: string|number;
    }

    export interface Props extends IViewProps {
        variables: Variable[];
    }

    export class VariableView extends View<Props, undefined> {
        constructor(props: AllProps<Props>) {
            super(props);
        }

        render(): React.ReactNode {
            return (
                <div className='variables'>
                    {this.props.variables.map((variable, i) => {
                        const klasses = classNames({
                            'variable': true,
                            'variable_cat_default': true,
                            [`variable_${variable.type}`]: true,
                        });

                        const value = variable.type == 'colour' ? '#' + variable.value : variable.value;

                        return <div key={i} className={klasses}>
                            <div className="variable__name">{variable.name}</div>
                            <div className="variable__value">{value}</div>
                        </div>
                    })}
                </div>
            )
        }
    }
}

export default VariableView;