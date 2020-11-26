import {ImperativeView} from "../../core/base/view/ImperativeView";
import {AllProps, deferUntilMounted, IViewProps, IViewState} from "../../core/base/view/View";
import LessonPaneWrapper from "../../wrappers/LessonPaneWrapper";
import {ViewEvent} from "../../core/base/Event";

// passed by DefinePlugin in Webpack config
declare const __VERSION__: string;

const BOARD_STATUSES = {
    SEARCH: 'search',
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    NONE: 'none',
};

interface NavbarViewProps extends IViewProps {
    logoText: string;
    imagesPath: string;
    devMode: boolean;
}

interface NavbarViewState extends IViewState {

}

export namespace NavbarView {
    export class MissionSelectEvent extends ViewEvent<MissionSelectEvent> {
        mission_idx: number;
    }

    export class ExerciseSelectEvent extends ViewEvent<ExerciseSelectEvent> {
        mission_idx: number;
        exercise_idx: number;
    }

    export class StatusClickEvent extends ViewEvent<StatusClickEvent> {}

    export class NavbarView extends ImperativeView<NavbarViewProps, NavbarViewState> {
        static defaultOptions: NavbarViewProps = {
            logoText: "Tapanda",
            imagesPath: "",
            devMode: false
        }

        private lesson_pane: LessonPaneWrapper;

        constructor(props: AllProps<NavbarViewProps>) {
            super(props);

            this.lesson_pane = new LessonPaneWrapper();
            this.lesson_pane.registerLogoText("Tapanda");
            this.setMenuStructure();

            if (this.props.devMode) {
                this.clickDeveloperMenuBarItem(true);
            } else {
                this.clickDeveloperMenuBarItem(false);
            }

            this.setup();
        }

        protected inject(container: HTMLDivElement): void {
            this.lesson_pane.inject(container);
        }

        protected eject(container: HTMLDivElement): void {

        }

        /**
         * Показать кнопки заданий
         *
         * Информация о каждом задании представляется следующим форматом:
         * {
         *      'category': номер категории,
         *      'exercises': массив упражнений (см. ниже),
         *      'name': название задания (опционально)
         * }
         *
         * Информация о каждом упражнении представляется следующим форматом:
         * {
         *      mission: ID задания,
         *      pk: ID упражнения
         * }
         *
         * @param missions список заданий
         */
        public showMissionButtons(missions: any) {
            this.lesson_pane.setMissions(missions);
        }

        /**
         * Установить текущее задание
         *
         * @param mission_idx индекс задания
         */
        public setMissionCurrent(mission_idx: number) {
            this.lesson_pane.setMissionActive(mission_idx);
        }

        /**
         * Установить прогресс задания
         *
         * Информация о задании представляется с помощью сследующего формата:
         * {
         *      'missionIDX': номер задания,
         *      'exerciseCount': кол-во упражнений в задании,
         *      'exerciseIDX': текущее упражнение в задании
         * }
         */
        public setMissionProgress(mission_idx: number, exercise_idx: number) {
            this.lesson_pane.setMissionProgress(mission_idx, exercise_idx);
        }

        /**
         * Включить режим "пробуксовки" задания
         *
         * Режим "пробуксовки" - состояние задания, при котором номер текущего
         * упражнения не совпадает с номером последнего: например, пользователь отказался
         * переходить на следующее упражнение при прохождении текущего.
         *
         * @param mission_idx индекс задания
         */
        public setMissionSkiddingOn(mission_idx: number) {
            this.lesson_pane.setMissionSkidding(mission_idx, true);
        }

        /**
         * Установить текущее упражнение
         *
         * Выделяется указываемое упражнение текущего задания
         *
         * @param {number} exercise_idx индекс упражнения
         * @returns {Promise<any>}
         */
        public setExerciseCurrent(exercise_idx: number) {
            this.lesson_pane.setExerciseActive(exercise_idx);
        }

        /**
         * Установить текст урока
         *
         * @param lesson_name название урока
         */
        @deferUntilMounted
        public setLessonText(lesson_name: string) {
            let text = "Урок: " + lesson_name;

            this.lesson_pane.setLessonText(text);
        }

        public switchMenu(on: boolean) {
            this.lesson_pane.switchMenu(on);
        }

        public switchDeveloperMode(on: boolean) {
            this.lesson_pane.switchDevMode(on);
        }

        private clickDeveloperMenuBarItem(on: boolean) {
            this.lesson_pane.clickMenuBarItem({item_name: "developer", on});
        }

        private setMenuStructure() {
            this.lesson_pane.setMenuStructure([
                {
                    type: 'default',
                    name: "lessons",
                    text: "Уроки",
                    handler: (name: string) => {
                        console.log('menu click', name);
                    }
                },
                {
                    type: 'default',
                    name: "settings",
                    text: "Настройки",
                    handler: (name: string) => {
                        console.log('settings click', name);
                    }
                },
                {
                    type: 'radio',
                    name: "developer",
                    text: "Разработчик",
                    handler: (name: string, pressed: boolean) => {
                        console.log('developer click', {name: name, state: pressed});
                    }
                },
                {
                    type: 'disabled',
                    name: "origin",
                    text: window.location.host,
                    text_sub: __VERSION__,
                    right: true
                },
            ]);
        }

        private setup() {
            this.lesson_pane.onMissionClick((idx: number) => {
                this.emit(new MissionSelectEvent({mission_idx: idx}));
            });

            this.lesson_pane.onMenuClick(function() {
                console.log('on menu click', arguments);
            });

            this.lesson_pane.onReturnClick(() => {
                console.log('on return click');
            });

            this.lesson_pane.onExerciseClick((id: number) => {
                console.log('on exercise click', id);
            });

            this.lesson_pane.onUserExerciseClick((mission_idx: number, exercise_idx: number) => {
                this.emit(new MissionSelectEvent({mission_idx, exercise_idx}));
            });

            this.lesson_pane.onStatusClick(() => {
                this.emit(new StatusClickEvent());
            });
        }
    }
}