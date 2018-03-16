import MissionBarBlock from "./blocks/bars/MissionBarBlock";
import LessonBarBlock from "./blocks/bars/LessonBarBlock";
import MenuBarBlock from "./blocks/bars/MenuBarBlock";
import CourseChipBlock from "./blocks/chips/CourseChipBlock";
import LogoChipBlock from "./blocks/chips/LogoChipBlock";
import MenuChipBlock from "./blocks/chips/MenuChipBlock";
import TaskChipBlock from "./blocks/chips/TaskChipBlock";

import thm from "./styles/containers/lesson-pane.css";

const CLASEES = {
    CONTAINER_MAIN: "lesson-pane",
    CONTAINER_NORTH: "lesson-pane-north",
    CONTAINER_SOUTH: "lesson-pane-south",
};

class LessonPane {
    constructor() {
        this._containers = {
            north: {
                west: undefined,
                center: undefined,
                east: undefined
            },
            south: {
                west: undefined,
                center: undefined
            }
        };

        this._blocks = {
            bars: {
                lesson: new LessonBarBlock(),
                menu: new MenuBarBlock(),
                mission: new MissionBarBlock(),
            },

            chips: {
                course: new CourseChipBlock(),
                logo: new LogoChipBlock(),
                menu: new MenuChipBlock(),
                task: new TaskChipBlock()
            }
        };

        this._state = {
            included: false
        };
    }

    /**
     * Встроить панель
     *
     * @param dom_node
     */
    include(dom_node) {
        if (!dom_node) {throw new TypeError("DOM Node is not defined")}

        this._composeContainers(dom_node);
        this._includeBlocks();

        this._state.included = true;
    }

    setExercises() {
        if (!this._state.included) {throw new Error("Cannot set any exercises, include first")}

        this._blocks.bars.mission.setExercises(["text1", "text2", "text3", "text4"]);
        this._blocks.bars.mission.setExerciseActive(1);
        this._blocks.bars.mission.setExerciseActive(2);

        this._blocks.bars.lesson.setMissions([
            {exerciseCount: 2},
            {exerciseCount: 3},
            {exerciseCount: 4},
            {exerciseCount: 1},
            {exerciseCount: 1},
            {exerciseCount: 1},
            {exerciseCount: 1},
            {exerciseCount: 1},
            {exerciseCount: 1},
            {exerciseCount: 1},
            {exerciseCount: 1},
            {exerciseCount: 1},
            {exerciseCount: 1},
            {exerciseCount: 1},
            {exerciseCount: 1},
            {exerciseCount: 1},
        ]);

        LessonBarBlock.runStyle();

        this._blocks.bars.lesson.onClick(data => {
            console.log('ONCLICK', data);
        });

        this._blocks.bars.lesson.setMissionActive(2);
        this._blocks.bars.lesson.setMissionActive(3);
        this._blocks.bars.lesson.setMissionActive(4);
        this._blocks.bars.lesson.setMissionActive(5);

        this._blocks.bars.lesson.setMissionProgress(0, 1);
        this._blocks.bars.lesson.setMissionProgress(1, 1);
        this._blocks.bars.lesson.setMissionProgress(2, 1);
        this._blocks.bars.lesson.setMissionProgress(3, 1);
        this._blocks.bars.lesson.setMissionProgress(4, 1);
        this._blocks.bars.lesson.setMissionProgress(5, 1);
        this._blocks.bars.lesson.setMissionProgress(6, 1);
        this._blocks.bars.lesson.setMissionProgress(7, 1);
        this._blocks.bars.lesson.setMissionProgress(8, 1);
        this._blocks.bars.lesson.setMissionProgress(9, 2);
    }

    /**
     * Скомпоновать дерево контейнеров
     *
     * @param dom_node
     * @private
     */
    _composeContainers(dom_node) {
        if (!dom_node) {throw new TypeError("DOM Node is not defined")}

        let containers = {
            north: document.createElement("div"),
            south: document.createElement("div"),
        };

        /// создать верхний и нижний контейнеры
        containers.north.classList = CLASEES.CONTAINER_NORTH;
        containers.south.classList = CLASEES.CONTAINER_SOUTH;

        /// создать и вставить контейнеры в верхний контейнер
        for (let c_north_id of Object.keys(this._containers.north)) {
            this._containers.north[c_north_id] = document.createElement("div");
            this._containers.north[c_north_id].classList = CLASEES.CONTAINER_NORTH + '-' + c_north_id;
            containers.north.appendChild(this._containers.north[c_north_id]);
        }

        /// создать и вставить контейнеры в нижний контейнер
        for (let c_south_id of Object.keys(this._containers.south)) {
            this._containers.south[c_south_id] = document.createElement("div");
            this._containers.south[c_south_id].classList = CLASEES.CONTAINER_SOUTH + '-' + c_south_id;
            containers.south.appendChild(this._containers.south[c_south_id]);
        }

        /// вставить верхний и нижний контейнеры в главный узел
        dom_node.appendChild(containers.north);
        dom_node.appendChild(containers.south);

        /// главному узлу присвоить класс
        dom_node.classList += " " + CLASEES.CONTAINER_MAIN;
    }

    /**
     * Встроить блоки в контейнеры
     *
     * Контейнеры должны быть скомпонованы прежде, чем
     * эта функция будет вызвана
     *
     * @private
     */
    _includeBlocks() {
        this._blocks.bars.mission.include(this._containers.south.center);
        this._blocks.bars.lesson.include(this._containers.north.east);
    }
}

export default LessonPane;