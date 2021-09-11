import * as React from "react";
import { ViewEvent } from "~/js/core/base/Event";
import { View } from "~/js/core/base/view/View";

import i18next from 'i18next';

require("css/blocks/issue.less");
require("css/blocks/generic/btn.less");
require('css/core/form.less');

namespace IssueView {
    export class IssueReportRequestEvent extends ViewEvent<IssueReportRequestEvent> {
        message?: string;
    }

    export class LogDownloadRequestEvent extends ViewEvent<LogDownloadRequestEvent> {}

    export class IssueView extends View<undefined, undefined> {
        render(): React.ReactNode {
            return <div className="issue">
                {/* <div className="issue__section">
                    <p className="issue__text">
                        Если произошла какая-то проблема, возникла ошибка или программа
                        ведёт себя неожиданно, отправьте отчёт, дополнив его текстовым описанием.
                        Сообщение будет отправлено на электронный адрес поддержки <a href="mailto:support@tapanda.ru">support@tapanda.ru</a>.
                        К сообщению будет прикреплён журнал событий, записанных в процессе использования программы.
                    </p>
                </div>

                <div className="issue__section">
                    <input type="text" className="input" />
                    <div className="btn-bar btn-bar_right">
                        <div className="btn btn_sm btn_warning" onClick={() => this.emit(new IssueReportRequestEvent())}>Отправить отчёт</div>
                    </div>
                </div>

                <hr/> */}

                <div className="issue__section">
                    <p className="issue__text">{i18next.t('main:issue.event_log_text')}</p>
                </div>

                <div className="issue__section btn-bar btn-bar_right">
                    <div className="btn btn_sm btn_success" onClick={() => this.emit(new LogDownloadRequestEvent())}>{i18next.t('main:issue.event_log_download')}</div>
                </div>
            </div>
        }
    }
}

export default IssueView;