import Model from "../base/model/Model";
import DummyDatasource from "../base/model/datasources/DummyDatasource";
import {ModelEvent} from "../base/Event";

const BUTTON_CODES_ALLOWED = [
    48 /* 0 */, 81 /* Q */, 65 /* A */, 38 /* UP    */,
    49 /* 1 */, 87 /* W */, 83 /* S */, 40 /* DOWN  */,
    50 /* 2 */, 69 /* E */, 68 /* D */, 37 /* LEFT  */,
    51 /* 3 */, 82 /* R */, 70 /* F */, 39 /* RIGHT */,
    52 /* 4 */, 84 /* T */, 71 /* G */,
    53 /* 5 */, 89 /* Y */, 72 /* H */,
    54 /* 6 */,
    55 /* 7 */,
    56 /* 8 */,
    57 /* 9 */,
];

interface KeyboardModelState {
    buttons: [string, boolean][];
}

export default class KeyboardModel extends Model<KeyboardModelState, DummyDatasource> {
    static alias = 'keyboard';

    private button_seq_idx: number;
    private button_seq_model: number[];

    defaultState: KeyboardModelState = {
        buttons: [],
    }

    public init(state: KeyboardModelState) {
        super.init(state);

        document.addEventListener("keyup", evt => {
            if (!(BUTTON_CODES_ALLOWED.indexOf(evt.keyCode) > -1)) return;

            let is_correct = undefined;

            if (this.button_seq_model) {
                is_correct = this.validateButtonPress(evt.keyCode);
            }

            this.state.buttons.push([evt.key, is_correct]);

            if (this.state.buttons.length > 50) {
                this.state.buttons = this.state.buttons.slice(this.state.buttons.length - 50);
            }

            this.emit(new KeyUpEvent({
                orig: evt,
                code: evt.code,
                key: evt.key
            }));
        })
    }

    public reset() {
        this.state.buttons = [];
    }

    /**
     * Установить эталонную последовательность нажатий клавиш
     *
     * @param button_seq_model эталонная последовательность нажатий клавиш
     */
    public setButtonSeqModel(button_seq_model: number[]) {
        this.button_seq_model = button_seq_model;
        this.button_seq_idx = 0;
    }

    /**
     * Проверить правильность нажатия клавиши
     *
     * @param button_code
     *
     * @returns sequence matches to model
     */
    public validateButtonPress(button_code: number): boolean {
        if (this.button_seq_model.length === 0) return;

        if (button_code === this.button_seq_model[this.button_seq_idx]) {
            if (this.button_seq_idx + 1 === this.button_seq_model.length) {
                this.button_seq_idx = 0;

                this.emit(new KeySeqMatchEvent());
            } else {
                this.button_seq_idx += 1;
            }

            return true;
        }

        this.button_seq_idx = 0;

        return false;
    }
}

export class KeySeqMatchEvent extends ModelEvent<KeySeqMatchEvent> {}

export class KeyUpEvent extends ModelEvent<KeyUpEvent> {
    orig: KeyboardEvent;
    code: string;
    key: string;
}