/// https://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
function () {
    "use strict";
    let str = this.toString();
    if (arguments.length) {
        let t = typeof arguments[0];
        let key;
        let args = ("string" === t || "number" === t) ?
            Array.prototype.slice.call(arguments)
            : arguments[0];

        for (key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }

    return str;
};