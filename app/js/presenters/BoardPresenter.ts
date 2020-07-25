import Presenter, {action, on} from "../core/base/Presenter";
import {Action, BooleanAction} from "../core/base/Event";
import BoardView, {ChangeEvent} from "../views/BoardView";

export class EditAction extends BooleanAction<EditAction> {}

export default class BoardPresenter extends Presenter<BoardView> {
    protected static actions: Map<Action<any>, string> = new Map([
        [EditAction, 'Редактировать'],
    ]);

    constructor(view: BoardView) {
        super(view);

        console.log('BoardPresenter created');
    }

    @action(EditAction)
    test() {
        this.view.setReadOnly(true);
    }

    @on(ChangeEvent)
    onchange(evt: ChangeEvent) {
        console.log('onchange', evt);
    }
}