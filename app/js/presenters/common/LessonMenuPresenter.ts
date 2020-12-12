import Presenter, {on} from "../../core/base/Presenter";
import {LessonMenuView} from "../../views/common/LessonMenuView";
import CourseModel from "../../models/CourseModel";
import LessonModel from "../../models/LessonModel";

export default class LessonMenuPresenter extends Presenter<LessonMenuView.LessonMenuView> {
    private course: CourseModel;

    public async getInitialProps() {
        this.course = this.getModel(CourseModel);

        this.course.list().then((courses) => {this.setViewProps({courses})});
    }

    @on(LessonMenuView.LessonSelectEvent)
    private onLessonSelected(evt: LessonMenuView.LessonSelectEvent) {
        this.forward('lesson', [evt.lesson_id]);
    }
}