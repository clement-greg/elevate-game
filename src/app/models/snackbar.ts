

export class Snackbar {
    static show(message, duration = 4000) {
        if (!duration) {
            duration = 4000;
        }

        var snackbar = document.getElementById('snackbar');
        snackbar.classList.add('show');
        snackbar.innerHTML = message;
        setTimeout(() => snackbar.classList.remove('show'), duration);
    }
}