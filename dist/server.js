'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _definitions = require('./definitions');

var _manager = require('./manager');

var _manager2 = _interopRequireDefault(_manager);

var _messageTypes = require('./messageTypes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Server = function () {
	function Server({ schema: schema, pubsub: pubsub }, ref) {
		_classCallCheck(this, Server);

		if (!_manager2.default) {
			throw new Error('Must provide `subscriptionManager` to websocket server constructor.');
		}

		this.ws = ref;
		this.subscriptionManager = new _manager2.default({ schema: schema, pubsub: pubsub });

		this.ws.on('connection', this.handleConnection.bind(this));
	}

	Server.prototype.sendSubscriptionData = function sendSubscriptionData(socket, id, payload) {
		socket.emit(_definitions.EVENT_KEY, {
			type: _messageTypes.SUBSCRIPTION_DATA,
			id: id,
			payload: payload
		});
	};

	Server.prototype.sendSubscriptionFail = function sendSubscriptionFail(socket, id, payload) {
		socket.emit(_definitions.EVENT_KEY, {
			type: _messageTypes.SUBSCRIPTION_FAIL,
			id: id,
			payload: payload
		});
	};

	Server.prototype.sendSubscriptionSuccess = function sendSubscriptionSuccess(socket, id) {
		socket.emit(_definitions.EVENT_KEY, {
			type: _messageTypes.SUBSCRIPTION_SUCCESS,
			id: id
		});
	};

	Server.prototype.handleConnection = function handleConnection(socket) {
		var connectionSubscriptions = {};

		socket.on(_definitions.EVENT_KEY, this.onMessage(socket, connectionSubscriptions));
		socket.on('disconnect', this.onClose(socket, connectionSubscriptions));
	};

	Server.prototype.onClose = function onClose(socket, connectionSubscriptions) {
		return () => {
			Object.keys(connectionSubscriptions).forEach(subId => {
				this.subscriptionManager.unsubscribe(connectionSubscriptions[subId]);
				delete connectionSubscriptions[subId];
			});
		};
	};

	Server.prototype.onMessage = function onMessage(socket, connectionSubscriptions) {
		return ({ id: id, type: type, query: query, variables: variables, operationName: operationName }) => {
			var params, subId, errors, message;
			return regeneratorRuntime.async(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							_context.t0 = type;
							_context.next = _context.t0 === _messageTypes.SUBSCRIPTION_START ? 3 : _context.t0 === _messageTypes.SUBSCRIPTION_END ? 19 : 21;
							break;

						case 3:
							params = {
								query: query,
								variables: variables,
								operationName: operationName,
								context: {},
								formatResponse: undefined,
								formatError: undefined,
								callback: (error, result) => {
									if (!error) {
										this.sendSubscriptionData(socket, id, result);
									} else if (error.errors) {
										this.sendSubscriptionData(socket, id, { errors: error.errors });
									} else {
										this.sendSubscriptionData(socket, id, { errors: [{ message: error.message }] });
									}
								}
							};


							if (connectionSubscriptions[id]) {
								this.subscriptionManager.unsubscribe(connectionSubscriptions[id]);
								delete connectionSubscriptions[id];
							}

							_context.prev = 5;
							_context.next = 8;
							return regeneratorRuntime.awrap(this.subscriptionManager.subscribe(params));

						case 8:
							subId = _context.sent;

							connectionSubscriptions[id] = subId;
							this.sendSubscriptionSuccess(socket, id);
							_context.next = 18;
							break;

						case 13:
							_context.prev = 13;
							_context.t1 = _context['catch'](5);
							errors = _context.t1.errors;
							message = _context.t1.message;

							if (errors) {
								this.sendSubscriptionFail(socket, id, { errors: errors });
							} else {
								this.sendSubscriptionFail(socket, id, { errors: [{ message: message }] });
							}

						case 18:
							return _context.abrupt('break', 22);

						case 19:
							if (typeof connectionSubscriptions[id] !== 'undefined') {
								this.subscriptionManager.unsubscribe(connectionSubscriptions[id]);
								delete connectionSubscriptions[id];
							}

							return _context.abrupt('break', 22);

						case 21:
							this.sendSubscriptionFail(socket, id, {
								errors: [{
									message: 'Invalid message type. Message type must be `subscription_start` or `subscription_end`.'
								}]
							});

						case 22:
						case 'end':
							return _context.stop();
					}
				}
			}, null, this, [[5, 13]]);
		};
	};

	return Server;
}();

exports.default = Server;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2ZXIuanMiXSwibmFtZXMiOlsiU2VydmVyIiwic2NoZW1hIiwicHVic3ViIiwicmVmIiwiRXJyb3IiLCJ3cyIsInN1YnNjcmlwdGlvbk1hbmFnZXIiLCJvbiIsImhhbmRsZUNvbm5lY3Rpb24iLCJiaW5kIiwic2VuZFN1YnNjcmlwdGlvbkRhdGEiLCJzb2NrZXQiLCJpZCIsInBheWxvYWQiLCJlbWl0IiwidHlwZSIsInNlbmRTdWJzY3JpcHRpb25GYWlsIiwic2VuZFN1YnNjcmlwdGlvblN1Y2Nlc3MiLCJjb25uZWN0aW9uU3Vic2NyaXB0aW9ucyIsIm9uTWVzc2FnZSIsIm9uQ2xvc2UiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsInN1YklkIiwidW5zdWJzY3JpYmUiLCJxdWVyeSIsInZhcmlhYmxlcyIsIm9wZXJhdGlvbk5hbWUiLCJwYXJhbXMiLCJjb250ZXh0IiwiZm9ybWF0UmVzcG9uc2UiLCJ1bmRlZmluZWQiLCJmb3JtYXRFcnJvciIsImNhbGxiYWNrIiwiZXJyb3IiLCJyZXN1bHQiLCJlcnJvcnMiLCJtZXNzYWdlIiwic3Vic2NyaWJlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7QUFFQTs7OztBQUVBOzs7Ozs7SUFRcUJBLE07QUFDcEIsaUJBQVksRUFBRUMsY0FBRixFQUFVQyxjQUFWLEVBQVosRUFBZ0NDLEdBQWhDLEVBQXFDO0FBQUE7O0FBQ3BDLE1BQUksa0JBQUosRUFBMEI7QUFDekIsU0FBTSxJQUFJQyxLQUFKLENBQVUscUVBQVYsQ0FBTjtBQUNBOztBQUVELE9BQUtDLEVBQUwsR0FBVUYsR0FBVjtBQUNBLE9BQUtHLG1CQUFMLEdBQTJCLHNCQUF3QixFQUFFTCxjQUFGLEVBQVVDLGNBQVYsRUFBeEIsQ0FBM0I7O0FBRUEsT0FBS0csRUFBTCxDQUFRRSxFQUFSLENBQVcsWUFBWCxFQUF5QixLQUFLQyxnQkFBTCxDQUFzQkMsSUFBdEIsQ0FBMkIsSUFBM0IsQ0FBekI7QUFDQTs7a0JBRURDLG9CLGlDQUFxQkMs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SCxXQUFJRCxNQUFKLEVBQVk7QUFDWCxhQUFLckIsb0JBQUwsQ0FBMEJMLE1BQTFCLEVBQWtDQyxFQUFsQyxFQUFzQyxFQUFFeUIsY0FBRixFQUF0QztBQUNBLFFBRkQsTUFFTztBQUNOLGFBQUtyQixvQkFBTCxDQUEwQkwsTUFBMUIsRUFBa0NDLEVBQWxDLEVBQXNDLEVBQUV5QixRQUFRLENBQUMsRUFBRUMsZ0JBQUYsRUFBRCxDQUFWLEVBQXRDO0FBQ0E7O0FBbkNFO0FBQUE7O0FBQUE7QUF3Q0osV0FBSSxPQUFPcEIsd0JBQXdCTixFQUF4QixDQUFQLEtBQXVDLFdBQTNDLEVBQXdEO0FBQ3ZELGFBQUtOLG1CQUFMLENBQXlCbUIsV0FBekIsQ0FBcUNQLHdCQUF3Qk4sRUFBeEIsQ0FBckM7QUFDQSxlQUFPTSx3QkFBd0JOLEVBQXhCLENBQVA7QUFDQTs7QUEzQ0c7O0FBQUE7QUErQ0osWUFBS0ksb0JBQUwsQ0FBMEJMLE1BQTFCLEVBQWtDQyxFQUFsQyxFQUFzQztBQUNyQ3lCLGdCQUFRLENBQUM7QUFDUkMsa0JBQVM7QUFERCxTQUFEO0FBRDZCLFFBQXRDOztBQS9DSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFQO0FBc0RBLEU7Ozs7O2tCQTFHbUJ0QyxNIiwiZmlsZSI6InNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVWRU5UX0tFWSB9IGZyb20gJy4vZGVmaW5pdGlvbnMnXG5cbmltcG9ydCBzdWJzY3JpcHRpb25NYW5hZ2VyIGZyb20gJy4vbWFuYWdlcidcblxuaW1wb3J0IHtcblx0U1VCU0NSSVBUSU9OX0ZBSUwsXG5cdFNVQlNDUklQVElPTl9EQVRBLFxuXHRTVUJTQ1JJUFRJT05fU1RBUlQsXG5cdFNVQlNDUklQVElPTl9FTkQsXG5cdFNVQlNDUklQVElPTl9TVUNDRVNTXG59IGZyb20gJy4vbWVzc2FnZVR5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXJ2ZXIge1xuXHRjb25zdHJ1Y3Rvcih7IHNjaGVtYSwgcHVic3ViIH0sIHJlZikge1xuXHRcdGlmICghc3Vic2NyaXB0aW9uTWFuYWdlcikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdNdXN0IHByb3ZpZGUgYHN1YnNjcmlwdGlvbk1hbmFnZXJgIHRvIHdlYnNvY2tldCBzZXJ2ZXIgY29uc3RydWN0b3IuJylcblx0XHR9XG5cblx0XHR0aGlzLndzID0gcmVmXG5cdFx0dGhpcy5zdWJzY3JpcHRpb25NYW5hZ2VyID0gbmV3IHN1YnNjcmlwdGlvbk1hbmFnZXIoeyBzY2hlbWEsIHB1YnN1YiB9KVxuXHRcdFxuXHRcdHRoaXMud3Mub24oJ2Nvbm5lY3Rpb24nLCB0aGlzLmhhbmRsZUNvbm5lY3Rpb24uYmluZCh0aGlzKSlcblx0fVxuXG5cdHNlbmRTdWJzY3JpcHRpb25EYXRhKHNvY2tldCwgaWQsIHBheWxvYWQpIHtcblx0XHRzb2NrZXQuZW1pdChFVkVOVF9LRVksIHtcblx0XHRcdHR5cGU6IFNVQlNDUklQVElPTl9EQVRBLFxuXHRcdFx0aWQsXG5cdFx0XHRwYXlsb2FkXG5cdFx0fSlcblx0fVxuXG5cdHNlbmRTdWJzY3JpcHRpb25GYWlsKHNvY2tldCwgaWQsIHBheWxvYWQpIHtcblx0XHRzb2NrZXQuZW1pdChFVkVOVF9LRVksIHtcblx0XHRcdHR5cGU6IFNVQlNDUklQVElPTl9GQUlMLFxuXHRcdFx0aWQsXG5cdFx0XHRwYXlsb2FkXG5cdFx0fSlcblx0fVxuXG5cdHNlbmRTdWJzY3JpcHRpb25TdWNjZXNzKHNvY2tldCwgaWQpIHtcblx0XHRzb2NrZXQuZW1pdChFVkVOVF9LRVksIHtcblx0XHRcdHR5cGU6IFNVQlNDUklQVElPTl9TVUNDRVNTLFxuXHRcdFx0aWRcblx0XHR9KVxuXHR9XG5cblx0aGFuZGxlQ29ubmVjdGlvbihzb2NrZXQpIHtcblx0XHRjb25zdCBjb25uZWN0aW9uU3Vic2NyaXB0aW9ucyA9IHt9XG5cblx0XHRzb2NrZXQub24oRVZFTlRfS0VZLCB0aGlzLm9uTWVzc2FnZShzb2NrZXQsIGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zKSlcblx0XHRzb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCB0aGlzLm9uQ2xvc2Uoc29ja2V0LCBjb25uZWN0aW9uU3Vic2NyaXB0aW9ucykpXG5cdH1cblxuXHRvbkNsb3NlKHNvY2tldCwgY29ubmVjdGlvblN1YnNjcmlwdGlvbnMpIHtcblx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0T2JqZWN0LmtleXMoY29ubmVjdGlvblN1YnNjcmlwdGlvbnMpLmZvckVhY2goIChzdWJJZCkgPT4ge1xuXHRcdFx0XHR0aGlzLnN1YnNjcmlwdGlvbk1hbmFnZXIudW5zdWJzY3JpYmUoY29ubmVjdGlvblN1YnNjcmlwdGlvbnNbc3ViSWRdKVxuXHRcdFx0XHRkZWxldGUgY29ubmVjdGlvblN1YnNjcmlwdGlvbnNbc3ViSWRdXG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXG5cdG9uTWVzc2FnZShzb2NrZXQsIGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zKSB7XG5cdFx0cmV0dXJuIGFzeW5jICh7IGlkLCB0eXBlLCBxdWVyeSwgdmFyaWFibGVzLCBvcGVyYXRpb25OYW1lIH0pID0+IHtcblx0XHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0XHRjYXNlIFNVQlNDUklQVElPTl9TVEFSVDpcblx0XHRcdFx0XHRjb25zdCBwYXJhbXMgPSB7XG5cdFx0XHRcdFx0XHRxdWVyeSxcblx0XHRcdFx0XHRcdHZhcmlhYmxlcyxcblx0XHRcdFx0XHRcdG9wZXJhdGlvbk5hbWUsXG5cdFx0XHRcdFx0XHRjb250ZXh0OiB7fSxcblx0XHRcdFx0XHRcdGZvcm1hdFJlc3BvbnNlOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRmb3JtYXRFcnJvcjogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0Y2FsbGJhY2s6IChlcnJvciwgcmVzdWx0KSA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmICghZXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnNlbmRTdWJzY3JpcHRpb25EYXRhKHNvY2tldCwgaWQsIHJlc3VsdClcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChlcnJvci5lcnJvcnMpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnNlbmRTdWJzY3JpcHRpb25EYXRhKHNvY2tldCwgaWQsIHsgZXJyb3JzOiBlcnJvci5lcnJvcnMgfSlcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnNlbmRTdWJzY3JpcHRpb25EYXRhKHNvY2tldCwgaWQsIHsgZXJyb3JzOiBbeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH1dIH0pXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoY29ubmVjdGlvblN1YnNjcmlwdGlvbnNbaWRdKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnN1YnNjcmlwdGlvbk1hbmFnZXIudW5zdWJzY3JpYmUoY29ubmVjdGlvblN1YnNjcmlwdGlvbnNbaWRdKVxuXHRcdFx0XHRcdFx0ZGVsZXRlIGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zW2lkXVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRjb25zdCBzdWJJZCA9IGF3YWl0IHRoaXMuc3Vic2NyaXB0aW9uTWFuYWdlci5zdWJzY3JpYmUocGFyYW1zKVxuXHRcdFx0XHRcdFx0Y29ubmVjdGlvblN1YnNjcmlwdGlvbnNbaWRdID0gc3ViSWRcblx0XHRcdFx0XHRcdHRoaXMuc2VuZFN1YnNjcmlwdGlvblN1Y2Nlc3Moc29ja2V0LCBpZClcblx0XHRcdFx0XHR9IGNhdGNoKHsgZXJyb3JzLCBtZXNzYWdlIH0pIHtcblx0XHRcdFx0XHRcdGlmIChlcnJvcnMpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5zZW5kU3Vic2NyaXB0aW9uRmFpbChzb2NrZXQsIGlkLCB7IGVycm9ycyB9KVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5zZW5kU3Vic2NyaXB0aW9uRmFpbChzb2NrZXQsIGlkLCB7IGVycm9yczogW3sgbWVzc2FnZSB9XSB9KVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgU1VCU0NSSVBUSU9OX0VORDpcblx0XHRcdFx0XHRpZiAodHlwZW9mIGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zW2lkXSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdHRoaXMuc3Vic2NyaXB0aW9uTWFuYWdlci51bnN1YnNjcmliZShjb25uZWN0aW9uU3Vic2NyaXB0aW9uc1tpZF0pXG5cdFx0XHRcdFx0XHRkZWxldGUgY29ubmVjdGlvblN1YnNjcmlwdGlvbnNbaWRdXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0aGlzLnNlbmRTdWJzY3JpcHRpb25GYWlsKHNvY2tldCwgaWQsIHtcblx0XHRcdFx0XHRcdGVycm9yczogW3tcblx0XHRcdFx0XHRcdFx0bWVzc2FnZTogJ0ludmFsaWQgbWVzc2FnZSB0eXBlLiBNZXNzYWdlIHR5cGUgbXVzdCBiZSBgc3Vic2NyaXB0aW9uX3N0YXJ0YCBvciBgc3Vic2NyaXB0aW9uX2VuZGAuJ1xuXHRcdFx0XHRcdFx0fV1cblx0XHRcdFx0XHR9KVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuIl19