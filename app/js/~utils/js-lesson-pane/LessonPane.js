import MissionBarBlock from "./blocks/bars/MissionBarBlock";
import LessonBarBlock from "./blocks/bars/LessonBarBlock";
import MenuBarBlock from "./blocks/bars/MenuBarBlock";
import CourseChipBlock from "./blocks/chips/CourseChipBlock";
import LogoChipBlock from "./blocks/chips/LogoChipBlock";
import MenuChipBlock from "./blocks/chips/MenuChipBlock";
import TaskChipBlock from "./blocks/chips/TaskChipBlock";

import thm from "./blocks/containers/lesson-pane.css";

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
        }
    }

    include(dom_node) {
        if (!dom_node) {throw new TypeError("DOM Node is not defined")}

        this._composeContainers(dom_node);
    }

    _composeContainers(dom_node) {
        if (!dom_node) {throw new TypeError("DOM Node is not defined")}

        let containers = {
            north: document.createElement("div"),
            south: document.createElement("div"),
        };

        containers.north.classList  = CLASEES.CONTAINER_MAIN + " " + CLASEES.CONTAINER_NORTH;
        containers.south.classList  = CLASEES.CONTAINER_MAIN + " " + CLASEES.CONTAINER_SOUTH;

        dom_node.appendChild(containers.north);
        dom_node.appendChild(containers.south);

        dom_node.classList += " " + CLASEES.CONTAINER_MAIN
    }
}

export default LessonPane;