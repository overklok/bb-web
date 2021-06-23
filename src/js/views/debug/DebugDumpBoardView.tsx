/**
 * This module is used only for development purposes.
 * Some applications can optionally use this to visualize board circuit verification.
 */

import * as React from "react";
import {IViewProps, View} from "../../core/base/view/View";
import {ViewEvent} from "../../core/base/Event";

require('../../../css/blocks/generic/btn.less')
require('../../../css/blocks/fabdesk.less')


namespace DebugDumpBoardView {
    export class DumpClickEvent extends ViewEvent<DumpClickEvent> {}
    export class VerifyClickEvent extends ViewEvent<VerifyClickEvent> {}

    export class DebugDumpBoardView extends View<IViewProps, undefined> {
        private handleDumpClick() {
            this.emit(new DumpClickEvent());
        }

        public render(): React.ReactNode {
            return (
                <div className='fabdesk'>
                    <div className="btn btn_primary fabdesk__fab" onClick={() => this.handleDumpClick()}>
                        Сделать снимок
                    </div>
                </div>
            )
        }
    }
}

export default DebugDumpBoardView;