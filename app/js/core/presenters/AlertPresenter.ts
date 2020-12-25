import Presenter, {on} from "../base/Presenter";
import {PresenterErrorEvent} from "../base/Event";
import AlertView from "../views/modal/AlertView";

export default class AlertPresenter extends Presenter<AlertView> {
    protected alerts: { content: string }[] = [];

    getInitialProps(): any {
        console.log('gip', 'ap');
        console.log(this.presets);
    }

    @on(PresenterErrorEvent)
    private async onAlert(evt: PresenterErrorEvent) {
        const {error} = evt;

        this.alerts.push({content: error.message});

        this.setViewProps({
            alerts: [...this.alerts]
        });
    }
}