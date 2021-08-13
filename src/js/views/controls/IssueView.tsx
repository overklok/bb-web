import * as React from "react";
import { ViewEvent } from "~/js/core/base/Event";
import { View } from "~/js/core/base/view/View";

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
                <div className="issue__section">
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

                <hr/>

                <div className="issue__section">
                    <p className="issue__text">
                        В целях отладки бывает полезно приложить журнал событий, который можно загрузить, нажав на кнопку ниже.
                        В нём может содержаться полезная информация о предшествующих ошибках или предупреждениях, что может облегчить процесс
                        выявления причин проблемы.
                    </p>
                </div>

                <div className="issue__section btn-bar btn-bar_right">
                    <div className="btn btn_sm btn_success" onClick={() => this.emit(new LogDownloadRequestEvent())}>Скачать журнал событий</div>
                </div>
            </div>
        }
    }
}

export default IssueView;