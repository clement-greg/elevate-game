export class World {
    gravity = .5;
    width = 400000;
    scrollPosition = 0;
    height = 900;

    static instance;

    initialize() {
        document.getElementById('bg-sky').style.width = this.width + 'px';
        document.getElementById('bg-buildings').style.width = this.width + 'px';
        document.getElementById('bg-plants').style.width = this.width + 'px';
        document.getElementById('game-div').style.width = this.width + 'px';
        // document.getElementById('foreground').style.width = this.width + 'px';
        //foreground

        window.addEventListener('resize',()=> {
            this.setScale();
        });
        this.setScale();
    }

    getScalePercentage() {

        
        const windowHeight = window.innerHeight;
        if(windowHeight > this.height) {
            return 1;
        }
        return windowHeight / this.height;
        // return (pct * 100) + '%';
    }

    setScale() {
        //document.getElementById('game-container').style.transform = `scale(${this.getScalePercentage()})`;
    }

    static getInstance() {
        if (!World.instance) {
            World.instance = new World();
            World.instance.initialize();
        }

        return World.instance;
    }
}