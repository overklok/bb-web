import * as React from "react";
import { ViewEvent } from "~/js/core/base/Event";
import { IViewProps, View } from "~/js/core/base/view/View";

require('css/logo.less');
require('css/blocks/about.less');
require('css/blocks/generic/btn.less');

namespace AboutView {
    export class IssuePromptEvent extends ViewEvent<IssuePromptEvent> {}

    export interface Props extends IViewProps {
        ver_web: string;
        ver_cli?: { self: (string|number)[], core: (string|number)[] };
        ver_srv?: { self: (string|number)[], core: (string|number)[], verifier: (string|number)[] };
    }

    export class AboutView extends View<Props> {
        static defaultProps = {
            ver_web: 'n/a',
            ver_cli: { self: ['n/a'], core: ['n/a'] },
            ver_srv: { self: ['n/a'], core: ['n/a'], verifier: ['n/a'] },
        }

        render(): React.ReactNode {            
            return <div className="about">
                <div className="about__heading">
                    <div className="about__heading-section">
                        <div className="logo logo__full" />
                        <p className="logo-subscription">макетная плата</p>
                    </div>

                    <div className="about__heading-section about__version">
                        <p className="about__version_line">
                            <b>web:</b> {this.props.ver_web}
                        </p>
                        <p className="about__version_line">
                            <b>client:</b> {this.props.ver_cli.self.join('.')}&nbsp;
                            (<b>core:</b> {this.props.ver_cli.core.join('.')})
                        </p>
                        <p className="about__version_line">
                            <b>server:</b> {this.props.ver_srv.self.join('.')}&nbsp;
                            (<b>core:</b> {this.props.ver_srv.core.join('.')}, <b>verifier</b>: {this.props.ver_srv.verifier.join('.')})
                        </p>
                    </div>
                </div>

                {(this.props.ver_cli.self[0] != 'n/a') ?
                    <div className="about__footer btn-bar btn-bar_right">
                        <div className="btn btn_sm btn_danger" onClick={() => this.emit(new IssuePromptEvent())}>Скачать журнал событий{/*Сообщить об ошибке*/}</div>
                    </div>
                    : null
                }
            </div>
        }
    }
}

export default AboutView;