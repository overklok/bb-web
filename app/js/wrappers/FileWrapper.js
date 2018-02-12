import Wrapper from '../core/Wrapper';

class FileWrapper extends Wrapper {
    constructor() {
        super();
    }

    saveStrToFile(filename, str) {
        let file = new Blob([str], {type: "text/plain;charset=utf-8"});

        if (window.navigator.msSaveOrOpenBlob) {
            // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        } else {
            // Others
            let a = document.createElement("a");
            let url = URL.createObjectURL(file);

            a.href = url;
            a.download = filename;

            document.body.appendChild(a);

            a.click();

            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    readStrFromFile(file) {
        return new Promise(resolve => {
            let reader = new FileReader();

            reader.readAsText(file, "UTF-8");

            reader.onload = (evt) => {
                resolve(evt.target.result);
            };
        });
    }
}

export default FileWrapper;