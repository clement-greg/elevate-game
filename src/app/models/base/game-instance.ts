import { NgZone } from "@angular/core";
// import { Game } from "./levels/game";
// import { NVGame } from "./levels/nv-game";
import { PubSub } from "../utilities/pub-sub";
import { World } from "../environment/world";
import { Game } from "./game";

export class GameInstanceManager {

    static location: 'AZ' | 'UT' | 'NV';
    static gameInstance: Game;

    static getInstance(zone: NgZone = null): Game {


        if (!GameInstanceManager.gameInstance) {
            if (this.location === 'NV') {
                // GameInstanceManager.gameInstance = new NVGame(zone);
                GameInstanceManager.gameInstance = new Game(zone, this.location);
            } else if(this.location === 'AZ'){
                GameInstanceManager.gameInstance = new Game(zone, this.location);
            } else {
                // GameInstanceManager.gameInstance = new Game(zone);
                GameInstanceManager.gameInstance = new Game(zone, this.location);
            }
        }

        return GameInstanceManager.gameInstance;
    }

    static deleteInstance() {
        PubSub.deleteInstance();
        World.deleteInstance();
        if (GameInstanceManager.gameInstance) {
            GameInstanceManager.gameInstance.stop();
        }
        delete GameInstanceManager.gameInstance;
    }

    static clearInstance(zone: NgZone) {
        GameInstanceManager.gameInstance = new Game(zone, this.location);
    }

    static hasInstance() {
        return this.gameInstance !== null && this.gameInstance != undefined;
    }
    
    static lastStars: number;
}