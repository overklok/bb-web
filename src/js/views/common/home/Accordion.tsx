import * as React from "react";
import classNames from "classnames";

require("~/css/blocks/home/accordion.less");

export interface AccordionProps {
    head: React.ReactNode;
    children?: React.ReactNode;
    is_collapsed?: boolean;
    on_uncollapse?: () => void;
}

// export default function Accordion(props: AccordionProps) {
//     const klasses = classNames({
//         'accordion': true,
//         'accordion_collapsed': props.is_collapsed
//     });

//     // TODO: call on_uncollapse, pass control to the outer component

//     return (
//         <div className={klasses}>
//             <div className="accordion__head acc-head" onClick={() => setIsCollapsed(!is_collapsed)}>
//                 <div className="acc-head__content">
//                     {props.head}
//                 </div>
//                 <div className="acc-head__controls">
//                     <div className="btn__collapse btn__collapse_active">
//                         btn
//                     </div>
//                 </div>
//             </div>

//             <div className="accordion__body">
//                 {props.children}
//             </div>
//         </div>
//     )
// }