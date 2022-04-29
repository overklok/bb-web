import * as React from "react";
import classNames from "classnames";

require("~/css/blocks/home/accordion.less");

export interface AccordionProps {
    head: React.ReactNode;
    children?: React.ReactNode;
}

export default function Accordion(props: AccordionProps) {
    const [is_collapsed] = React.useState(true);

    return (
        <div className="accordion">
            <div className="accordion__head">
                {props.head}
            </div>

            <div className="accordion__body">
                {props.children}
            </div>
        </div>
    )
}