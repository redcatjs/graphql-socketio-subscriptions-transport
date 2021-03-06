import { EVENT_KEY } from './definitions'

import subscriptionManager from './manager'

import {
	SUBSCRIPTION_FAIL,
	SUBSCRIPTION_START,
	SUBSCRIPTION_END,
	SUBSCRIPTION_SUCCESS
} from './messageTypes'

export default class Server {
	constructor({ schema, pubsub }, ref) {
		if (!subscriptionManager) {
			throw new Error('Must provide `subscriptionManager` to websocket server constructor.')
		}

		this.ws = ref
		this.subscriptionManager = new subscriptionManager({ schema, pubsub })
		
		this.ws.on('connection', this.handleConnection.bind(this))
	}

	sendSubscriptionData(socket, id, payload) {
		socket.emit(EVENT_KEY, {
			id,
			payload
		})
	}

	sendSubscriptionFail(answer, id, payload) {
		answer({
			type: SUBSCRIPTION_FAIL,
			id,
			payload
		})
	}

	sendSubscriptionSuccess(answer, id) {
		answer({
			type: SUBSCRIPTION_SUCCESS,
			id
		})
	}

	handleConnection(socket) {
		const connectionSubscriptions = {}
		socket.on(EVENT_KEY, this.onMessage(socket, connectionSubscriptions))
		socket.on('disconnect', this.onClose(socket, connectionSubscriptions))
	}

	onClose(socket, connectionSubscriptions) {
		return () => {
			Object.keys(connectionSubscriptions).forEach( (subId) => {
				this.subscriptionManager.unsubscribe(connectionSubscriptions[subId])
				delete connectionSubscriptions[subId]
			})
		}
	}

	onMessage(socket, connectionSubscriptions) {
		return async ({ id, type, query, variables, operationName }, answer) => {
			switch (type) {
				case SUBSCRIPTION_START:
					const params = {
						query,
						variables,
						operationName,
						context: {},
						formatResponse: undefined,
						formatError: undefined,
						callback: (error, result) => {
							if (!error) {
								this.sendSubscriptionData(socket, id, result)
							} else if (error.errors) {
								this.sendSubscriptionData(socket, id, { errors: error.errors })
							} else {
								this.sendSubscriptionData(socket, id, { errors: [{ message: error.message }] })
							}
						}
					}

					if (connectionSubscriptions[id]) {
						this.subscriptionManager.unsubscribe(connectionSubscriptions[id])
						delete connectionSubscriptions[id]
					}

					try {
						const subId = await this.subscriptionManager.subscribe(params)
						connectionSubscriptions[id] = subId
						this.sendSubscriptionSuccess(answer, id)
					} catch(e) {
						const { errors, message } = e;
						if (errors) {
							this.sendSubscriptionFail(answer, id, { errors })
						}
						else if(message) {
							this.sendSubscriptionFail(answer, id, { errors: [{ message }] })
						}
						else{
							this.sendSubscriptionFail(answer, id, { errors: e })
						}
					}

					break
				case SUBSCRIPTION_END:
					if (typeof connectionSubscriptions[id] !== 'undefined') {
						this.subscriptionManager.unsubscribe(connectionSubscriptions[id])
						delete connectionSubscriptions[id]
					}

					break
				default:
					this.sendSubscriptionFail(answer, id, {
						errors: [{
							message: 'Invalid message type. Message type must be `subscription_start` or `subscription_end`.'
						}]
					})
			}
		}
	}
}
