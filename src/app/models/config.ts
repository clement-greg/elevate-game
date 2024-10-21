export class Config {

    playerJumpForce: number;
    playerMaxXVelocity: number;
    trampolineYForce: number;
    gameSeconds: number;
  showGameWinTime: number;
  showGameLostTime: number;
    static setInstance(config: any) {
        Config.instance = config;
        localStorage.setItem('config', JSON.stringify(config));
    }

    framesPerSecond: number;
    gravity: number;
    playerMoveForceGrounded: number;
    playerMoveForceNotGrounded: number;
    ramSpeed: number;
    cannonBallSpeed: number;
    scrollBackground: boolean;
    showBilboardVideos: boolean;

    private static instance: Config;
    static getInstance() {

        if (!Config.instance) {
            if (localStorage.getItem('config')) {
                try {
                    Config.instance = JSON.parse(localStorage.getItem('config'));
                } catch { }
            }
            if (!Config.instance) {
                const i = new Config();
                i.framesPerSecond = 60;
                i.gravity = 1;
                i.playerJumpForce = -0.32;
                i.playerMoveForceGrounded = 0.02;
                i.playerMoveForceNotGrounded = 0.01;
                i.playerMaxXVelocity = 3;
                i.trampolineYForce = -0.3 ;
                i.ramSpeed = 2;
                i.cannonBallSpeed = 20;
                i.gameSeconds = 240;
                i.showGameLostTime = 30000;
                i.showGameWinTime = 30000;
                i.scrollBackground = true;

                Config.instance = i;
            }

        }

        return Config.instance;
    }
}