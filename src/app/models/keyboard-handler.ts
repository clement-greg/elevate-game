import { PubSub } from "./pub-sub";

export class KeyboardHandler {
    static instance;
    pubsub;

    keyStates = {};

    constructor() {
        this.pubsub = PubSub.getInstance();
        document.addEventListener('keydown', event => {
            this.keyStates[event.code] = true;
            this.pubsub.publish('keydown', event);
        });
        document.addEventListener('keyup', event => {
            this.keyStates[event.code] = false;
            this.pubsub.publish('keyup', event);
        });
    }

    isKeyDown(key) {
        return this.keyStates[key];
    }

    static getInstance() {
        if (!KeyboardHandler.instance) {
            KeyboardHandler.instance = new KeyboardHandler();
        }

        return KeyboardHandler.instance;
    }

}