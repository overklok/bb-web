import Presenter, {on, restore} from "../../core/base/Presenter";
import RichTextView from "../../views/common/RichTextView";
import {PopoverShowEvent} from "../../models/LessonModel";

export default class PopoverLessonPresenter extends Presenter<RichTextView.RichTextView> {
    @restore() @on(PopoverShowEvent)
    private showPopover(evt: PopoverShowEvent) {
        this.setViewProps({content: evt.content});
    }
}