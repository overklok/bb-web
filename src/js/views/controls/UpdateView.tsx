
import * as React from "react";
import { View } from "~/js/core/base/view/View";

import i18next from 'i18next';

require("css/blocks/issue.less");
require("css/blocks/generic/btn.less");
require('css/core/form.less');

namespace UpdateView {
    interface Props {
        version_new: string;
        version_old: string;
        download_url: string;
    }

    export class UpdateView extends View<Props, undefined> {
        render(): React.ReactNode {
            return <div className="update">
                <h2>{i18next.t('main:update.heading')}</h2>

                <p dangerouslySetInnerHTML={{
                    __html: i18next.t('main:update.version_details', {
                        ver_old: this.props.version_old,
                        ver_new: this.props.version_new,
                        interpolation: { escapeValue: false }
                    })
                }}>
                </p>
                <p>
                    {i18next.t('main:update.update_prompt')} <a href={this.props.download_url} target="_blank">{i18next.t('main:update.update_link')}</a>.
                </p>
            </div>
        }
    }
}

export default UpdateView;