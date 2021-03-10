import * as React from "react";

import {View} from "../../core/base/view/View";

require('css/blocks/settings.less');
require('css/core/sidebar.less');
require('css/core/form.less');

export namespace SettingsView {
    export class SettingsView extends View<any, any> {
        render(): React.ReactNode {
            return <div className="settings">
                <div className="settings__categories sidebar">
                    <div className="sidebar__item sidebar__item_active">Item 1</div>
                    <div className="sidebar__item">Item 2</div>
                    <div className="sidebar__item">Item 3</div>
                    <div className="sidebar__item">Item 4</div>
                </div>
                <form className="settings__content form">
                    <h2>Item 1</h2>
                </form>
            </div>;
        }
    }
}