export function overlayThreads(threads) {
    const groups = [];
    const threads_divided = [];

    // Divide threads to groups
    // Each group consists of adjacent threads of same orientation
    for (const thread of threads) {
        let added = false;

        for (const group of groups) {
            // Each thread must be added only for one specific group
            if (belongsToGroup(group, thread)) {
                addToGroup(group, thread);
                added = true;
                break;
            }
        }

        // If there are no groups found for the thread,
        // init a new one and add the thread at one time
        if (!added) {
            groups.push(createGroup(thread));
        }
    }

    // Split threads in each group, considering that each intersection
    // creates new thread, which weight is sum of adjacent threads' weights
    for (const group of groups) {
        // List of all threads' points, projected onto a common axis
        let axis = new Set();

        // Add all pairs' unique values to a single set

        group.pairs.forEach(pair => pair.points.forEach(axis.add, axis));

        axis = Array.from(axis).sort((a, b) => a - b);

        for (let i = 0; i < axis.length - 1; i++) {
            const [a_from, a_to] = axis.slice(i, i+2);

            // Main axis is the static axis (for horizontal currents it's 'y')
            // Side axis is the dynamic one (for which the points was projected in the 'axis' set)
            const [axis_main, axis_side] = group.is_horz ? ['y', 'x'] : ['x', 'y'];

            const thread = {
                from: {[axis_main]: group.main_axis_point, [axis_side]: a_from},
                to: {[axis_main]: group.main_axis_point, [axis_side]: a_to},
                weight: 0
            }

            threads_divided.push(thread);

            for (const {points: [p_from, p_to], weight} of group.pairs) {
                const g_thread = {
                    from: {[axis_main]: group.main_axis_point, [axis_side]: p_from},
                    to: {[axis_main]: group.main_axis_point, [axis_side]: p_to},
                }

                if (doesIntersectionExist(thread, g_thread)) {
                    thread.weight += Number(weight);
                }
            }

            if (thread.weight < 0) {
                thread.weight = -thread.weight;
                [thread.from, thread.to] = [thread.to, thread.from];
            }
        }
    }

    return threads_divided;
}

export function doesIntersectionExist(thread_1, thread_2) {
    const is_vert_1 = thread_1.from.y === thread_1.to.y;
    const is_vert_2 = thread_2.from.y === thread_2.to.y;

    if (is_vert_1 !== is_vert_2) {
        throw new Error('Orientations of given threads is different');
    }

    const [axis_main, axis_side] = is_vert_1 ? ['x', 'y'] : ['y', 'x'];

    if (thread_1.from[axis_side] !== thread_2.from[axis_side]) {
        return false;
    }

    let [c0, c1] = [
        thread_1.from[axis_main], thread_1.to[axis_main],
    ];

    let [p0, p1] = [
        thread_2.from[axis_main], thread_2.to[axis_main],
    ];

    // orient vectors (c0, c1), (p0, p1) to the same direction
    [c0, c1] = c0 > c1 ? [c1, c0] : [c0, c1];
    [p0, p1] = p0 > p1 ? [p1, p0] : [p0, p1];

    return !((p0 <= c0 && p1 <= c0) || (p0 >= c1 && p1 >= c1));
}

function belongsToGroup(group, thread) {
    const g_pairs = group.pairs;
    const g_is_horz = group.is_horz;

    const is_horz = thread.from.y === thread.to.y;

    if (g_is_horz !== is_horz) return false;

    for (const {points: [p_from, p_to]} of g_pairs) {
        const [axis_main, axis_side] = g_is_horz ? ['y', 'x'] : ['x', 'y'];

        const g_thread = {
            from: {[axis_main]: group.main_axis_point, [axis_side]: p_from},
            to: {[axis_main]: group.main_axis_point, [axis_side]: p_to},
        }

        if (doesIntersectionExist(thread, g_thread)) {
            return true;
        }
    }

    return false;
}

function createGroup(thread) {
    const is_horz = thread.from.y === thread.to.y,
          points = is_horz ? [thread.from.x, thread.to.x] : [thread.from.y, thread.to.y],
          dir = points[1] - points[0];

    return {
        pairs: [{
            points: dir > 0 ? [points[0], points[1]] : [points[1], points[0]],
            weight: dir > 0 ? thread.weight : -thread.weight
        }],
        main_axis_point: is_horz ? thread.from.y : thread.from.x,
        is_horz
    }
}

function addToGroup(group, thread) {
    const points = group.is_horz ? [thread.from.x, thread.to.x] : [thread.from.y, thread.to.y];
    const dir = points[1] - points[0];

    group.pairs.push({
        points: dir > 0 ? [points[0], points[1]] : [points[1], points[0]],
        weight: dir > 0 ? thread.weight : -thread.weight
    });
}
