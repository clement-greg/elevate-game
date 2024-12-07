import { NgZone } from "@angular/core";
import { Game } from "./levels/game";
import { NVGame } from "./levels/nv-game";
import { PubSub } from "./pub-sub";
import { World } from "./world";
import { AZGame } from "./levels/az-game";

export class GameInstanceManager {

    static location: 'AZ' | 'UT' | 'NV';
    static gameInstance: Game | NVGame | AZGame;

    static getInstance(zone: NgZone = null): Game | NVGame | AZGame {


        if (!GameInstanceManager.gameInstance) {
            if (this.location === 'NV') {
                GameInstanceManager.gameInstance = new NVGame(zone);
            } else if(this.location === 'AZ'){
                GameInstanceManager.gameInstance = new AZGame(zone);
            } else {
                GameInstanceManager.gameInstance = new Game(zone);
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
        GameInstanceManager.gameInstance = new Game(zone);
    }

    static hasInstance() {
        return this.gameInstance !== null && this.gameInstance != undefined;
    }
    
    static lastStars: number;
}