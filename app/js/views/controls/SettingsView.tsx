import * as React from "react";

import {AllProps, IViewProps, IViewState, View} from "../../core/base/view/View";
import {
    Setting,
    SettingsConfig,
    SettingsValues,
    SettingType,
    SettingValue
} from "../../core/datatypes/settings";

import classNames from "classnames";
import {ViewEvent} from "../../core/base/Event";

require('css/blocks/settings.less');
require('css/core/sidebar.less');
require('css/core/form.less');

export namespace SettingsView {
    interface Props extends IViewProps {
        config: SettingsConfig,
        values: SettingsValues
    }

    interface State extends IViewState {
        active_cat_key: string;
    }
    
    export class SettingsView extends View<Props, State> {
        constructor(props: AllProps<Props>) {
            super(props);

            this.state = {
                active_cat_key: Object.keys(props.config)[0]
            };
        }

        handleSettingChange(path: string, evt: React.ChangeEvent<HTMLInputElement>) {
            this.emit(new SettingChangeEvent({path, value: evt.target.value}));
        }

        render(): React.ReactNode {
            return <div className="settings">
                <div className="settings__categories sidebar">
                    {Object.entries(this.props.config).map(([cat_key, category]) => {
                        const klasses = classNames({
                            'sidebar__item': true,
                            'sidebar__item_active': this.state.active_cat_key == cat_key
                        });

                        return (
                            <div key={cat_key} className={klasses}>
                                {category.title}
                            </div>
                        )}
                    )}
                </div>
                {this.renderCurrentCategory()}
            </div>;
        }

        renderCurrentCategory() {
            const cat_key = this.state.active_cat_key,
                  category = this.props.config[cat_key];

            return (
                <form className="settings__content form">
                    <h2>{category.title}</h2>

                    {category.groups.map((group, idx) => {
                        return (
                            <div key={idx} className="form__group">
                                <h3>{group.title}</h3>

                                {Object.entries(group.settings).map(([key, setting], idx) =>
                                    this.renderInput(idx, cat_key, key, setting)
                                )}
                            </div>
                        );
                    })}
                </form>
            )
        }

        renderInput(idx: number, cat_key: string, key: string, setting: Setting) {
            const input_id = `${cat_key}.${key}`;

            switch (setting.type) {
                case SettingType.Boolean:
                    return (
                        <div key={idx} className="form__setting">
                            <label htmlFor={input_id}>
                                {setting.title}
                            </label>
                            <input
                                id={input_id}
                                type="checkbox"
                                className="checkbox"
                                onChange={event => this.handleSettingChange(input_id, event)}
                            />
                        </div>
                    );
                default: return null;
            }
        }
    }

    export class SettingChangeEvent extends ViewEvent<SettingChangeEvent> {
        path: string;
        value: SettingValue;
    }
}