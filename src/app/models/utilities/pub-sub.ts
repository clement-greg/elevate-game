export class PubSub {
    static intance;
    subscribers = {};

    static getInstance(): PubSub {
        if (!PubSub.intance) {
            PubSub.intance = new PubSub();
        }

        return PubSub.intance;
    }

    static deleteInstance() {
        delete PubSub.intance;
    }

    subscribe(eventName, callback) {
        if (!Array.isArray(this.subscribers[eventName])) {
            this.subscribers[eventName] = [];
        }

        this.subscribers[eventName].push(callback);

        const index = this.subscribers[eventName].length - 1;

        return {
            unsubscribe() {
                this.subscribers[eventName].splice(index, 1);
            }
        }
    }

    publish(eventName, data = null) {
        if(!Array.isArray(this.subscribers[eventName])) {
            return;
        }

        for(const callback of this.subscribers[eventName]) {
            callback(data);
        }
    }
}