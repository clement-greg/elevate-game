export class HTTP {
    static getData(url, method = 'GET') {
        if (!method) {
            method = 'GET';
        }

        return new Promise((resolve, reject) => {

            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = val => {
                if ((val.currentTarget as any).readyState == 4 && (val.currentTarget as any).status == 200) {
                    resolve(xhttp.responseText);
                }
            };
            xhttp.open(method, url, true);
            xhttp.send();
        });
    }

    static postData(url, data) {
        return new Promise((resolve, reject) => {

            var http = new XMLHttpRequest();
            http.open('POST', url, true);
            http.setRequestHeader('Content-type', 'application/json;charset=UTF-8');

            http.onreadystatechange = function () {
                if (http.readyState == 4 && http.status == 200) {
                    resolve(true);
                }
            }
            http.send(JSON.stringify(data, HTTP.replacer));
        });
    }

    static replacer(key, value) {
        if (key === 'body' || key === 'frictionTop' || key === 'groundSprite' || key === 'engine' || key === 'parts' || key === 'parent' || key === 'collision' || key === 'eagle') {
            return undefined;
        }

        return value;
    }

    static spriteReplacer(key, value) {
        if (Array.isArray(value)) {
            return value;
        }

        // Array items have a key that is numeric but still a string
        const intRegEx = /^\d+$/gm;
        if(intRegEx.test(key)) {
            return value;
        }

        const keys = ['x', 'y', 'id', 'originalX', 'originalY', 'objectType'];
        if(keys.indexOf(key) > -1) {
            return value;
        }

        return undefined;
    }
}
