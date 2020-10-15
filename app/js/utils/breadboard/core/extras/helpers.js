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

    const list = [];

    for (let i = from; i <= to; i++) {
        if (x_val != null) {
            list.push({x: x_val, y: i});
        } else if (y_val != null) {
            list.push({x: i, y: y_val});
        }
    }

    return list;
}