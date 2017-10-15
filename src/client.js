import { EVENT_KEY } from './definitions'

import {
	SUBSCRIPTION_FAIL,
	SUBSCRIPTION_START,
	SUBSCRIPTION_SUCCESS,
	SUBSCRIPTION_END
} from './messageTypes'

export default class Client {
	constructor(ref) {
		this.ws = ref
		this.subscriptions = {}
		this.maxId = 0
		this.reconnectSubscriptions = {}
		this.unsentMessagesQueue = []
		this.reconnecting = false

		this.ws.on(EVENT_KEY, this.handleData.bind(this))

		this.ws.on('connect', () => {
			this.sendUnsentMessages()
		})

		this.ws.on('reconnect_attempt', () => {
			if (!this.reconnecting) {
				this.reconnectSubscriptions = this.subscriptions
				this.subscriptions = {}
				this.reconnecting = true
			}
		})

		this.ws.on('reconnect', () => {
			this.reconnecting = false

			Object.keys(this.reconnectSubscriptions).forEach((key) => {
				const { options, handler } = this.reconnectSubscriptions[key]

				this.subscribe(options, handler)
			})

			this.sendUnsentMessages()
		})
	}

	handleData({ id, payload }) {
		if (payload.data && !payload.errors) {
			this.subscriptions[id].handler(null, payload.data)
		}
		else {
			this.subscriptions[id].handler(this.formatErrors(payload.errors), null)
		}
	}

	formatErrors(errors) {
		if (Array.isArray(errors)) {
			return errors
		}
		if (errors && errors.message) {
			return [errors]
		}

		return [{ message: 'Unknown error' }]
	}

	generateSubscriptionId() {
		const id = this.maxId
		this.maxId += 1
		return id
	}
	
	emit(message, answer){
		this.ws.emit(EVENT_KEY,message,answer);
	}
	
	sendUnsentMessages() {
		this.unsentMessagesQueue.forEach((arr)=>{
			this.emit(arr[0], ({type, id, payload})=>{
				if(arr[1]){
					arr[1](payload);
				}
			});
		});

		this.unsentMessagesQueue = [];
	}

	sendMessage(message, answer) {
		switch (this.ws.io.readyState) {
			case 'opening':
				this.unsentMessagesQueue.push([message,answer])

			break;
			case 'open':
				this.emit(message, ({type, id, payload})=>{
					switch(type){
						case SUBSCRIPTION_SUCCESS:
							this.subscriptions[id].pending = false;
						break;
						case SUBSCRIPTION_FAIL:
							this.subscriptions[id].handler(this.formatErrors(payload.errors), null);
							delete this.subscriptions[id];
						break;
					}
					if(answer){
						answer(payload);
					}
				});
			break;
			default:
				if (this.reconnecting) {
					this.unsentMessagesQueue.push([message,answer])
				}
				else {
					throw new Error('Client is not connected to a websocket.')
				}
			break;
		}
	}

	subscribe(options, handler, answer) {
		const { query, variables, operationName, context } = options

		if (!query) {
			throw new Error('Must provide `query` to subscribe.')
		}

		if (!handler) {
			throw new Error('Must provide `handler` to subscribe.')
		}

		if (
			( typeof query !== 'string' ) ||
			( operationName && (typeof operationName !== 'string') ) ||
			( variables && !(variables instanceof Object) )
		) {
			throw new Error('Incorrect option types to subscribe. `subscription` must be a string,' +
			'`operationName` must be a string, and `variables` must be an object.')
		}

		const subId = this.generateSubscriptionId()

		const message = Object.assign(options, {
			type: SUBSCRIPTION_START,
			id: subId
		})

		this.sendMessage(message, answer)
		this.subscriptions[subId] = { options, handler, pending: true }

		return subId
	}

	unsubscribe(id) {
		delete this.subscriptions[id]

		this.sendMessage({ id, type: SUBSCRIPTION_END })
	}

	unsubscribeAll() {
		Object.keys(this.subscriptions).forEach(subId => this.unsubscribe(parseInt(subId)))
	}
	
	
}
