import * as React from "react";
import Select from 'react-select';
import i18next from "i18next";

import {AllProps, IViewProps, IViewState, View} from "../../core/base/view/View";
import {Setting, SettingsConfig, SettingsValues, SettingType, SettingValue} from "../../core/datatypes/settings";

import classNames from "classnames";
import {ViewEvent} from "../../core/base/Event";

require('css/blocks/generic/btn.less');
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
        private is_dirty: boolean;

        constructor(props: AllProps<Props>) {
            super(props);

            this.state = {
                active_cat_key: Object.keys(props.config)[0]
            };
        }

        handleSettingChange(path: string, value: SettingValue) {
            this.emit(new SettingChangeEvent({path, value}));
        }

        handleCategoryChange(cat_key: string) {
            this.setState({
                active_cat_key: cat_key
            });
        }

        render(): React.ReactNode {
            return <div className="settings">
                <div className="settings__body">
                    <div className="settings__categories sidebar">
                        {Object.entries(this.props.config).map(([cat_key, category]) => {
                            const klasses = classNames({
                                'sidebar__item': true,
                                'sidebar__item_active': this.state.active_cat_key == cat_key
                            });

                            return (
                                <div key={cat_key} className={klasses} onClick={() => this.handleCategoryChange(cat_key)}>
                                    {i18next.t(category.title)}
                                </div>
                            )}
                        )}
                    </div>
                    {this.renderCurrentCategory()}
                </div>
            </div>;
        }

        renderCurrentCategory() {
            const cat_key = this.state.active_cat_key,
                  category = this.props.config[cat_key];

            return (
                <form className="settings__content form" key={cat_key}>
                    <h2>{i18next.t(category.title)}</h2>

                    <hr />

                    {category.groups.map((group, idx) => {
                        return (
                            <div key={idx} className="form__group">
                                <h3>{i18next.t(group.title)}</h3>

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
                                {i18next.t(setting.title)}
                            </label>
                            <input
                                id={input_id}
                                type="checkbox"
                                className="checkbox"
                                checked={!!this.props.values[cat_key][key]}
                                disabled={setting.is_locked}
                                onChange={e => this.handleSettingChange(input_id, !!e.target.checked)}
                            />
                        </div>
                    );
                case SettingType.ChoiceSingle:
                    const options = setting.choices;
                    
                    const defaultOption = options.find((item) => item.value === i18next.language);

                    const styles = {
                        container: (styles: any) => {
                            return { ...styles, width: 250 }
                        },
                        dropdownIndicator: (styles: any) => {
                            return { ...styles, cursor: 'pointer'} 
                        },
                        option: (styles: any) => {
                            return { ...styles, cursor: 'pointer', textAlign: 'left' }
                        },
                        singleValue: (styles: any) => {
                            return { ...styles, cursor: 'pointer' }
                        }
                    }

                    return (
                        <div key={idx} className="form__setting">
                            {i18next.t(setting.title)}
                            <Select
                                defaultValue={defaultOption}
                                options={options}
                                theme={theme => ({
                                    ...theme,
                                    borderRadius: 8,
                                })}
                                onChange={({ value, label }) => this.handleSettingChange(input_id, value)}
                                styles={styles}
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
