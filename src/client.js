import { EVENT_KEY } from './definitions'

import {
	SUBSCRIPTION_FAIL,
	SUBSCRIPTION_DATA,
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

		this.ws.on(EVENT_KEY, this.handleMessage.bind(this))

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

	handleMessage({ id, type, payload }) {
		switch (type) {
			case SUBSCRIPTION_SUCCESS:
				this.subscriptions[id].pending = false

				break
			case SUBSCRIPTION_FAIL:
				this.subscriptions[id].handler(this.formatErrors(payload.errors), null)
				delete this.subscriptions[id]

				break
			case SUBSCRIPTION_DATA:
				if (payload.data && !payload.errors) {
					this.subscriptions[id].handler(null, payload.data)
				} else {
					this.subscriptions[id].handler(this.formatErrors(payload.errors), null)
				}

				break
			default:
				throw new Error('Invalid message type - must be of type `subscription_start` or `subscription_data`.')
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

	sendUnsentMessages() {
		this.unsentMessagesQueue.forEach(
			message => this.ws.emit(EVENT_KEY, message)
		)

		this.unsentMessagesQueue = []
	}

	sendMessage(message) {
		switch (this.ws.io.readyState) {
			case 'opening':
				this.unsentMessagesQueue.push(message)

				break
			case 'open':
				this.ws.emit(EVENT_KEY, message)

				break
			default:
				if (this.reconnecting) {
					this.unsentMessagesQueue.push(message)
				} else {
					throw new Error('Client is not connected to a websocket.')
				}

				break
		}
	}

	subscribe(options, handler) {
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

		this.sendMessage(message)
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
