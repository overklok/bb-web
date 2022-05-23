import Presenter, {on} from "~/js/core/base/Presenter";
import HomeView from "~/js/views/common/HomeView";
import ProgressModel, { getLessonExercisesStats, getLessonMissionsStats } from "~/js/models/lesson/ProgressModel";
import SettingsModel from "~/js/core/models/SettingsModel";
import {RequestErrorEvent} from "~/js/core/models/HttpModel";
import CourseModel, {Course} from "~/js/models/lesson/CourseModel";

import i18next from 'i18next';

export default class MenuLessonPresenter extends Presenter<HomeView.HomeView> {
    private course: CourseModel;
    private settings: SettingsModel;
    private progress: ProgressModel;
    load_handle: ReturnType<typeof setTimeout>;

    public getInitialProps() {
        this.course = this.getModel(CourseModel);
        this.settings = this.getModel(SettingsModel);
        this.progress = this.getModel(ProgressModel);

        this.loadCourses();

        document.title = `Tapanda | Main menu`;

        return {
            lang: this.settings.getChoiceSingle("general.language"),
            lang_options: this.settings.getSetting("general", "language").choices
        }
    }

    @on(HomeView.LessonSelectEvent)
    private forwardLesson(evt: HomeView.LessonSelectEvent) {
        this.forward('lesson', [evt.course_id, evt.lesson_id]);
    }

    @on(HomeView.LanguageChangeEvent)
    private setLanguage(evt: HomeView.LanguageChangeEvent) {
        this.settings.setValue("general.language", evt.lang);
    }

    @on(RequestErrorEvent)
    private showError(evt: RequestErrorEvent) {
        this.setViewProps({
            error: i18next.t("main:home.error.no_server_access")
        });

        this.load_handle = setTimeout(() => {
            this.loadCourses();
        }, 2000);
    }

    private loadCourses() {
        this.course.list().then((courses) => {
            this.progress.loadStructure(courses);
            clearTimeout(this.load_handle);

            const progress = this.progress.getState();

            this.setViewProps({
                error: null, 
                opened: progress.opened,
                courses: courses.map((c, c_id) => ({
                    ...c, 
                    lessons: c.lessons.map(l => ({
                        ...l, 
                        stats: {
                            exercises: getLessonExercisesStats(progress.courses[c_id].lessons[l.id]),
                            missions:  getLessonMissionsStats(progress.courses[c_id].lessons[l.id]),
                        }
                    })),
                })), 
            });
        });
    }
}