// import { PubSub } from "./pub-sub";

// export class KeyboardHandler {
//     static instance;
//     pubsub;

//     keyStates = {};

//     constructor() {
//         this.pubsub = PubSub.getInstance();
//         // document.addEventListener('keydown', event => {
//         //     this.keyStates[event.code] = true;
//         //     this.pubsub.publish('keydown', event);
//         // });
//         // document.addEventListener('keyup', event => {
//         //     this.keyStates[event.code] = false;
//         //     this.pubsub.publish('keyup', event);
//         // });
//         document.addEventListener('keydown', this.keyDownEvent);
//         document.addEventListener('keyup', this.keyUpEvent);
//     }

//     keyDownEvent(event: KeyboardEvent) {
//         this.keyStates[event.code] = true;
//         this.pubsub.publish('keydown', event);
//     }

//     keyUpEvent(event: KeyboardEvent) {
//         this.keyStates[event.code] = false;
//         this.pubsub.publish('keyup', event);
//     }

//     static deleteInstance() {
//         if (KeyboardHandler.instance) {
//             document.removeEventListener('keydown', KeyboardHandler.instance.keyDownEvent);
//             document.removeEventListener('keyup', KeyboardHandler.instance.keyUpEvent);
//         }
//         delete KeyboardHandler.instance;
//     }

//     isKeyDown(key) {
//         return this.keyStates[key];
//     }

//     static getInstance() {
//         if (!KeyboardHandler.instance) {
//             KeyboardHandler.instance = new KeyboardHandler();
//         }

//         return KeyboardHandler.instance;
//     }

// }