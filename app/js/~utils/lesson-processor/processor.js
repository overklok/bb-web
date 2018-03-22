const EXER_TYPES = {
    CIRCUIT_ASM: 0,
    BLOCK_ASM: 1,
    BUTTON_SEQ: 2,
    COMBINED: 3,
    LOGIC_ASM: 4,
};

const EXER_SANDBOX_IGN = [
    "max_blocks", "listeners_only", "buttons_model", "verifier_model"
];

const EXER_TYPE_IGN = [
    [],
    ["buttons_model"],
    ["block_types", "max_blocks", "listeners_only", "verifier_model"],
    [],
    [],
];

let processLesson = (_lesson) => {
    if (!(_lesson.missions) || _lesson.missions.length === 0) {
        throw new Error("Lesson does not have any missions");
    }

    let missions = [];

    for (let _mission of _lesson.missions) {
        let mission = processMission(_mission);

        if (mission) missions.push(mission);
    }

    return {
        name: _lesson.name || "NONAME",
        description: _lesson.description || "NODESC",
        missions: missions
    };
};

let processMission = (_mission) => {
    if (!(_mission.exercises) || _mission.exercises.length === 0) {
        return null;
    }

    let exercises = [];

    for (let _exercise of _mission.exercises) {
        let exercise = processExercise(_exercise);

        if (exercise) exercises.push(exercise);
    }

    return {
        name: _mission.name || "NONAME",
        category: _mission.category,
        exercises: exercises
    };
};

let processExercise = (_exercise) => {
    let exercise = {};

    let type        = _exercise.type;
    let is_sandbox  = _exercise.is_sandbox || false;
    let popovers    = [];

    for (let _popover of _exercise.popovers) {
        let popover = processPopover(_popover);

        if (popover) popovers.push(popover);
    }

    if (popovers.length === 0) {popovers = null}

    /// копировать поля условно
    for (const [field, value] of Object.entries(_exercise)) {
        /// если поле не игнорируется по типу
        if (!(field in EXER_TYPE_IGN[type])) {
            /// если упражнение - не песочница и поле не игнорируется в песочнице
            if (!(is_sandbox && field in EXER_SANDBOX_IGN)) {
                exercise[field] = value;
            }
        }
    }

    exercise.popovers = popovers;
    if (exercise.buttons_model) {
        exercise.buttons_model = JSON.parse(exercise.buttons_model);
    } else {
        exercise.buttons_model = [];
    }

    /// editable - true/false
    /// check_buttons - true/false
    /// display_buttons - true/false
    /// layout_mode - simple/full
    /// max_blocks - 0/max_blocks
    /// is_sandbox - true/false
    /// launch_variant - 0(no),1(check),2(launch),3(check'n'launch)

    exercise.editable           = exercise.type !== 2;
    exercise.check_buttons      = !exercise.is_sandbox && (exercise.type >= 1 && exercise.type <= 3);
    exercise.display_buttons    = (exercise.type >= 1 && exercise.type <= 3) && exercise.display_buttons;
    exercise.layout_mode        = exercise.type === 0 ? 'simple' : 'full';
    exercise.launch_variant     = [0,4,5].indexOf(exercise.type) > -1 ? 1 : 0;
    exercise.launch_variant     =   [1,3].indexOf(exercise.type) > -1 ? 3 : exercise.launch_variant;
    exercise.launch_variant     = exercise.launch_variant === 3 && exercise.listeners_only ? 1 : exercise.launch_variant;
    exercise.launch_variant     = exercise.type !== 0 && exercise.is_sandbox ? 2 : exercise.launch_variant;

    exercise.max_blocks         = exercise.is_sandbox ? 0 : exercise.max_blocks;
    exercise.buttons_model      = exercise.check_buttons ? exercise.buttons_model : null;

    exercise.board_mode         = 'default';
    exercise.board_mode         = [1,2,3].indexOf(exercise.type) > -1 ? 'programming' : exercise.board_mode;
    exercise.board_mode         = exercise.type === 4 ? 'electronics' : exercise.board_mode;
    // exercise.board_mode         = exercise.type === 5 ? 'logic' : exercise.board_mode;

    return exercise;
};

let processPopover = (_popover) => {
    let intro_text = "";

    if (_popover.title) {
        intro_text += `<h1>${_popover.title}</h1>`;
    }

    intro_text += _popover.content;

    return {
        intro: intro_text,
        position: _popover.placement,
        element: _popover.element
    };
};

export default processLesson;