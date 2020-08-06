import Presenter, {action, on} from "../core/base/Presenter";
import {Action, BooleanAction} from "../core/base/Event";
import BoardView, {ChangeEvent} from "../views/BoardView";

export class EditAction extends BooleanAction<EditAction> {}

export default class BoardPresenter extends Presenter<BoardView> {
    protected static actions: Map<Action<any>, string> = new Map([
        [EditAction, 'Редактировать'],
    ]);

    protected ready() {

    }

    @action(EditAction)
    private test() {
        this.view.setReadOnly(true);
    }

    @on(ChangeEvent)
    private onchange(evt: ChangeEvent) {
        console.log('onchange', evt);
    }
}