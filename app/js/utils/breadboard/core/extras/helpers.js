export function coverObjects(options, defaults) {
  const result = {};

    if (!defaults) defaults = {};

    /// Если не заданы опции - выдать опции по умолчанию
    if (typeof options === "undefined") return defaults;

    /// Если options - массив, то возвратить копию значения
    if (Array.isArray(options)) return [...options];

    /// Если options - не объект, то возвратить копию значения
    if (typeof options !== 'object') return options;

    /// Для каждой заданной опции выполнить рекурсивно поиск опции
    for (const option_key of Object.keys(defaults)) {
        result[option_key] = coverObjects(options[option_key], defaults[option_key]);
    }

    for (const option_key of Object.keys(options)) {
        if (Object.keys(defaults).indexOf(option_key) > -1) continue;
        if (typeof options[option_key] === "undefined") continue;

        throw TypeError(`Key '${option_key}' does not exist in object being covered`);
    }

    return result;
}

export function pointsToCoordList(coords_from, coords_to) {
    let x_val = null,
        y_val = null;

    let from, to;

    if (coords_from.x === coords_to.x) {
        x_val = coords_from.x;
        from = coords_from.y;
        to = coords_to.y;
    }

    if (coords_from.y === coords_to.y) {
        y_val = coords_from.y;
        from = coords_from.x;
        to = coords_to.x;
    }

    return boundsToCoordList(from, to, x_val, y_val);
}

export function boundsToCoordList(from, to, x_val, y_val) {
    if (x_val != null && y_val != null) {
        throw Error("Only one of the dimensions might be fixed");
    }

    if (x_val == null && y_val == null) {
        throw Error("One of the dimensions should be fixed");
    }

    let is_inversed = false;

    if (from > to) {
        [from, to] = [to, from];
        is_inversed = true;
    }

    const list = [];

    for (let i = from; i <= to; i++) {
        let item = x_val != null ? {x: x_val, y: i} : {x: i, y: y_val};

        if (is_inversed) {
            list.unshift(item);
        } else {
            list.push(item);
        }
    }

    return list;
}

/**
 * Получить положение курсора в системе координат SVG
 *
 * @param {SVGSVGElement}   svg_main    SVG-узел, в системе координат которого нужна точка
 * @param {number}          clientX     Положение курсора по оси X
 * @param {number}          clientY     Положение курсора по оси Y
 *
 * @returns {SVGPoint}  точка, координаты которой определяют положение курсора
 *                      в системе координат заданного SVG-узла
 */
export function getCursorPoint(svg_main, clientX, clientY) {
    let svg_point = svg_main.createSVGPoint();

    svg_point.x = clientX;
    svg_point.y = clientY;

    return svg_point.matrixTransform(svg_main.getScreenCTM().inverse());
}