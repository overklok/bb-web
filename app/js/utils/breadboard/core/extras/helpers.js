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