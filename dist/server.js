'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _definitions = require('./definitions');

var _manager = require('./manager');

var _manager2 = _interopRequireDefault(_manager);

var _messageTypes = require('./messageTypes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Server = function () {
	function Server(_ref, ref) {
		var schema = _ref.schema,
		    pubsub = _ref.pubsub;
		(0, _classCallCheck3.default)(this, Server);

		if (!_manager2.default) {
			throw new Error('Must provide `subscriptionManager` to websocket server constructor.');
		}

		this.ws = ref;
		this.subscriptionManager = new _manager2.default({ schema: schema, pubsub: pubsub });

		this.ws.on('connection', this.handleConnection.bind(this));
	}

	(0, _createClass3.default)(Server, [{
		key: 'sendSubscriptionData',
		value: function sendSubscriptionData(socket, id, payload) {
			socket.emit(_definitions.EVENT_KEY, {
				type: _messageTypes.SUBSCRIPTION_DATA,
				id: id,
				payload: payload
			});
		}
	}, {
		key: 'sendSubscriptionFail',
		value: function sendSubscriptionFail(socket, id, payload) {
			socket.emit(_definitions.EVENT_KEY, {
				type: _messageTypes.SUBSCRIPTION_FAIL,
				id: id,
				payload: payload
			});
		}
	}, {
		key: 'sendSubscriptionSuccess',
		value: function sendSubscriptionSuccess(socket, id) {
			socket.emit(_definitions.EVENT_KEY, {
				type: _messageTypes.SUBSCRIPTION_SUCCESS,
				id: id
			});
		}
	}, {
		key: 'handleConnection',
		value: function handleConnection(socket) {
			var connectionSubscriptions = {};
			socket.on(_definitions.EVENT_KEY, this.onMessage(socket, connectionSubscriptions));
			socket.on('disconnect', this.onClose(socket, connectionSubscriptions));
		}
	}, {
		key: 'onClose',
		value: function onClose(socket, connectionSubscriptions) {
			var _this = this;

			return function () {
				(0, _keys2.default)(connectionSubscriptions).forEach(function (subId) {
					_this.subscriptionManager.unsubscribe(connectionSubscriptions[subId]);
					delete connectionSubscriptions[subId];
				});
			};
		}
	}, {
		key: 'onMessage',
		value: function onMessage(socket, connectionSubscriptions) {
			var _this2 = this;

			return function () {
				var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2) {
					var id = _ref2.id,
					    type = _ref2.type,
					    query = _ref2.query,
					    variables = _ref2.variables,
					    operationName = _ref2.operationName;
					var params, subId, errors, message;
					return _regenerator2.default.wrap(function _callee$(_context) {
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
										callback: function callback(error, result) {
											if (!error) {
												_this2.sendSubscriptionData(socket, id, result);
											} else if (error.errors) {
												_this2.sendSubscriptionData(socket, id, { errors: error.errors });
											} else {
												_this2.sendSubscriptionData(socket, id, { errors: [{ message: error.message }] });
											}
										}
									};


									if (connectionSubscriptions[id]) {
										_this2.subscriptionManager.unsubscribe(connectionSubscriptions[id]);
										delete connectionSubscriptions[id];
									}

									_context.prev = 5;
									_context.next = 8;
									return _this2.subscriptionManager.subscribe(params);

								case 8:
									subId = _context.sent;

									connectionSubscriptions[id] = subId;
									_this2.sendSubscriptionSuccess(socket, id);
									_context.next = 18;
									break;

								case 13:
									_context.prev = 13;
									_context.t1 = _context['catch'](5);
									errors = _context.t1.errors;
									message = _context.t1.message;

									if (errors) {
										_this2.sendSubscriptionFail(socket, id, { errors: errors });
									} else {
										_this2.sendSubscriptionFail(socket, id, { errors: [{ message: message }] });
									}

								case 18:
									return _context.abrupt('break', 22);

								case 19:
									if (typeof connectionSubscriptions[id] !== 'undefined') {
										_this2.subscriptionManager.unsubscribe(connectionSubscriptions[id]);
										delete connectionSubscriptions[id];
									}

									return _context.abrupt('break', 22);

								case 21:
									_this2.sendSubscriptionFail(socket, id, {
										errors: [{
											message: 'Invalid message type. Message type must be `subscription_start` or `subscription_end`.'
										}]
									});

								case 22:
								case 'end':
									return _context.stop();
							}
						}
					}, _callee, _this2, [[5, 13]]);
				}));

				return function (_x) {
					return _ref3.apply(this, arguments);
				};
			}();
		}
	}]);
	return Server;
}();

exports.default = Server;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2ZXIuanMiXSwibmFtZXMiOlsiU2VydmVyIiwicmVmIiwic2NoZW1hIiwicHVic3ViIiwiRXJyb3IiLCJ3cyIsInN1YnNjcmlwdGlvbk1hbmFnZXIiLCJvbiIsImhhbmRsZUNvbm5lY3Rpb24iLCJiaW5kIiwic29ja2V0IiwiaWQiLCJwYXlsb2FkIiwiZW1pdCIsInR5cGUiLCJjb25uZWN0aW9uU3Vic2NyaXB0aW9ucyIsIm9uTWVzc2FnZSIsIm9uQ2xvc2UiLCJmb3JFYWNoIiwic3ViSWQiLCJ1bnN1YnNjcmliZSIsInF1ZXJ5IiwidmFyaWFibGVzIiwib3BlcmF0aW9uTmFtZSIsInBhcmFtcyIsImNvbnRleHQiLCJmb3JtYXRSZXNwb25zZSIsInVuZGVmaW5lZCIsImZvcm1hdEVycm9yIiwiY2FsbGJhY2siLCJlcnJvciIsInJlc3VsdCIsInNlbmRTdWJzY3JpcHRpb25EYXRhIiwiZXJyb3JzIiwibWVzc2FnZSIsInN1YnNjcmliZSIsInNlbmRTdWJzY3JpcHRpb25TdWNjZXNzIiwic2VuZFN1YnNjcmlwdGlvbkZhaWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBRUE7Ozs7QUFFQTs7OztJQVFxQkEsTTtBQUNwQix1QkFBZ0NDLEdBQWhDLEVBQXFDO0FBQUEsTUFBdkJDLE1BQXVCLFFBQXZCQSxNQUF1QjtBQUFBLE1BQWZDLE1BQWUsUUFBZkEsTUFBZTtBQUFBOztBQUNwQyxNQUFJLGtCQUFKLEVBQTBCO0FBQ3pCLFNBQU0sSUFBSUMsS0FBSixDQUFVLHFFQUFWLENBQU47QUFDQTs7QUFFRCxPQUFLQyxFQUFMLEdBQVVKLEdBQVY7QUFDQSxPQUFLSyxtQkFBTCxHQUEyQixzQkFBd0IsRUFBRUosY0FBRixFQUFVQyxjQUFWLEVBQXhCLENBQTNCOztBQUVBLE9BQUtFLEVBQUwsQ0FBUUUsRUFBUixDQUFXLFlBQVgsRUFBeUIsS0FBS0MsZ0JBQUwsQ0FBc0JDLElBQXRCLENBQTJCLElBQTNCLENB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QTtBQThCTXNCLGVBOUJOLGVBOEJNQSxNQTlCTjtBQThCY0MsZ0JBOUJkLGVBOEJjQSxPQTlCZDs7QUErQkgsYUFBSUQsTUFBSixFQUFZO0FBQ1gsaUJBQUtJLG9CQUFMLENBQTBCM0IsTUFBMUIsRUFBa0NDLEVBQWxDLEVBQXNDLEVBQUVzQixjQUFGLEVBQXRDO0FBQ0EsVUFGRCxNQUVPO0FBQ04saUJBQUtJLG9CQUFMLENBQTBCM0IsTUFBMUIsRUFBa0NDLEVBQWxDLEVBQXNDLEVBQUVzQixRQUFRLENBQUMsRUFBRUMsZ0JBQUYsRUFBRCxDQUFWLEVBQXRDO0FBQ0E7O0FBbkNFO0FBQUE7O0FBQUE7QUF3Q0osYUFBSSxPQUFPbkIsd0JBQXdCSixFQUF4QixDQUFQLEtBQXVDLFdBQTNDLEVBQXdEO0FBQ3ZELGlCQUFLTCxtQkFBTCxDQUF5QmMsV0FBekIsQ0FBcUNMLHdCQUF3QkosRUFBeEIsQ0FBckM7QUFDQSxpQkFBT0ksd0JBQXdCSixFQUF4QixDQUFQO0FBQ0E7O0FBM0NHOztBQUFBO0FBK0NKLGdCQUFLMEIsb0JBQUwsQ0FBMEIzQixNQUExQixFQUFrQ0MsRUFBbEMsRUFBc0M7QUFDckNzQixrQkFBUSxDQUFDO0FBQ1JDLG9CQUFTO0FBREQsV0FBRDtBQUQ2QixVQUF0Qzs7QUEvQ0k7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBUDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQXNEQTs7Ozs7a0JBekdtQmxDLE0iLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRVZFTlRfS0VZIH0gZnJvbSAnLi9kZWZpbml0aW9ucydcblxuaW1wb3J0IHN1YnNjcmlwdGlvbk1hbmFnZXIgZnJvbSAnLi9tYW5hZ2VyJ1xuXG5pbXBvcnQge1xuXHRTVUJTQ1JJUFRJT05fRkFJTCxcblx0U1VCU0NSSVBUSU9OX0RBVEEsXG5cdFNVQlNDUklQVElPTl9TVEFSVCxcblx0U1VCU0NSSVBUSU9OX0VORCxcblx0U1VCU0NSSVBUSU9OX1NVQ0NFU1Ncbn0gZnJvbSAnLi9tZXNzYWdlVHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlcnZlciB7XG5cdGNvbnN0cnVjdG9yKHsgc2NoZW1hLCBwdWJzdWIgfSwgcmVmKSB7XG5cdFx0aWYgKCFzdWJzY3JpcHRpb25NYW5hZ2VyKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ011c3QgcHJvdmlkZSBgc3Vic2NyaXB0aW9uTWFuYWdlcmAgdG8gd2Vic29ja2V0IHNlcnZlciBjb25zdHJ1Y3Rvci4nKVxuXHRcdH1cblxuXHRcdHRoaXMud3MgPSByZWZcblx0XHR0aGlzLnN1YnNjcmlwdGlvbk1hbmFnZXIgPSBuZXcgc3Vic2NyaXB0aW9uTWFuYWdlcih7IHNjaGVtYSwgcHVic3ViIH0pXG5cdFx0XG5cdFx0dGhpcy53cy5vbignY29ubmVjdGlvbicsIHRoaXMuaGFuZGxlQ29ubmVjdGlvbi5iaW5kKHRoaXMpKVxuXHR9XG5cblx0c2VuZFN1YnNjcmlwdGlvbkRhdGEoc29ja2V0LCBpZCwgcGF5bG9hZCkge1xuXHRcdHNvY2tldC5lbWl0KEVWRU5UX0tFWSwge1xuXHRcdFx0dHlwZTogU1VCU0NSSVBUSU9OX0RBVEEsXG5cdFx0XHRpZCxcblx0XHRcdHBheWxvYWRcblx0XHR9KVxuXHR9XG5cblx0c2VuZFN1YnNjcmlwdGlvbkZhaWwoc29ja2V0LCBpZCwgcGF5bG9hZCkge1xuXHRcdHNvY2tldC5lbWl0KEVWRU5UX0tFWSwge1xuXHRcdFx0dHlwZTogU1VCU0NSSVBUSU9OX0ZBSUwsXG5cdFx0XHRpZCxcblx0XHRcdHBheWxvYWRcblx0XHR9KVxuXHR9XG5cblx0c2VuZFN1YnNjcmlwdGlvblN1Y2Nlc3Moc29ja2V0LCBpZCkge1xuXHRcdHNvY2tldC5lbWl0KEVWRU5UX0tFWSwge1xuXHRcdFx0dHlwZTogU1VCU0NSSVBUSU9OX1NVQ0NFU1MsXG5cdFx0XHRpZFxuXHRcdH0pXG5cdH1cblxuXHRoYW5kbGVDb25uZWN0aW9uKHNvY2tldCkge1xuXHRcdGNvbnN0IGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zID0ge31cblx0XHRzb2NrZXQub24oRVZFTlRfS0VZLCB0aGlzLm9uTWVzc2FnZShzb2NrZXQsIGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zKSlcblx0XHRzb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCB0aGlzLm9uQ2xvc2Uoc29ja2V0LCBjb25uZWN0aW9uU3Vic2NyaXB0aW9ucykpXG5cdH1cblxuXHRvbkNsb3NlKHNvY2tldCwgY29ubmVjdGlvblN1YnNjcmlwdGlvbnMpIHtcblx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0T2JqZWN0LmtleXMoY29ubmVjdGlvblN1YnNjcmlwdGlvbnMpLmZvckVhY2goIChzdWJJZCkgPT4ge1xuXHRcdFx0XHR0aGlzLnN1YnNjcmlwdGlvbk1hbmFnZXIudW5zdWJzY3JpYmUoY29ubmVjdGlvblN1YnNjcmlwdGlvbnNbc3ViSWRdKVxuXHRcdFx0XHRkZWxldGUgY29ubmVjdGlvblN1YnNjcmlwdGlvbnNbc3ViSWRdXG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXG5cdG9uTWVzc2FnZShzb2NrZXQsIGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zKSB7XG5cdFx0cmV0dXJuIGFzeW5jICh7IGlkLCB0eXBlLCBxdWVyeSwgdmFyaWFibGVzLCBvcGVyYXRpb25OYW1lIH0pID0+IHtcblx0XHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0XHRjYXNlIFNVQlNDUklQVElPTl9TVEFSVDpcblx0XHRcdFx0XHRjb25zdCBwYXJhbXMgPSB7XG5cdFx0XHRcdFx0XHRxdWVyeSxcblx0XHRcdFx0XHRcdHZhcmlhYmxlcyxcblx0XHRcdFx0XHRcdG9wZXJhdGlvbk5hbWUsXG5cdFx0XHRcdFx0XHRjb250ZXh0OiB7fSxcblx0XHRcdFx0XHRcdGZvcm1hdFJlc3BvbnNlOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRmb3JtYXRFcnJvcjogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0Y2FsbGJhY2s6IChlcnJvciwgcmVzdWx0KSA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmICghZXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnNlbmRTdWJzY3JpcHRpb25EYXRhKHNvY2tldCwgaWQsIHJlc3VsdClcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChlcnJvci5lcnJvcnMpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnNlbmRTdWJzY3JpcHRpb25EYXRhKHNvY2tldCwgaWQsIHsgZXJyb3JzOiBlcnJvci5lcnJvcnMgfSlcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnNlbmRTdWJzY3JpcHRpb25EYXRhKHNvY2tldCwgaWQsIHsgZXJyb3JzOiBbeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH1dIH0pXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoY29ubmVjdGlvblN1YnNjcmlwdGlvbnNbaWRdKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnN1YnNjcmlwdGlvbk1hbmFnZXIudW5zdWJzY3JpYmUoY29ubmVjdGlvblN1YnNjcmlwdGlvbnNbaWRdKVxuXHRcdFx0XHRcdFx0ZGVsZXRlIGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zW2lkXVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRjb25zdCBzdWJJZCA9IGF3YWl0IHRoaXMuc3Vic2NyaXB0aW9uTWFuYWdlci5zdWJzY3JpYmUocGFyYW1zKVxuXHRcdFx0XHRcdFx0Y29ubmVjdGlvblN1YnNjcmlwdGlvbnNbaWRdID0gc3ViSWRcblx0XHRcdFx0XHRcdHRoaXMuc2VuZFN1YnNjcmlwdGlvblN1Y2Nlc3Moc29ja2V0LCBpZClcblx0XHRcdFx0XHR9IGNhdGNoKHsgZXJyb3JzLCBtZXNzYWdlIH0pIHtcblx0XHRcdFx0XHRcdGlmIChlcnJvcnMpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5zZW5kU3Vic2NyaXB0aW9uRmFpbChzb2NrZXQsIGlkLCB7IGVycm9ycyB9KVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5zZW5kU3Vic2NyaXB0aW9uRmFpbChzb2NrZXQsIGlkLCB7IGVycm9yczogW3sgbWVzc2FnZSB9XSB9KVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgU1VCU0NSSVBUSU9OX0VORDpcblx0XHRcdFx0XHRpZiAodHlwZW9mIGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zW2lkXSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdHRoaXMuc3Vic2NyaXB0aW9uTWFuYWdlci51bnN1YnNjcmliZShjb25uZWN0aW9uU3Vic2NyaXB0aW9uc1tpZF0pXG5cdFx0XHRcdFx0XHRkZWxldGUgY29ubmVjdGlvblN1YnNjcmlwdGlvbnNbaWRdXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0aGlzLnNlbmRTdWJzY3JpcHRpb25GYWlsKHNvY2tldCwgaWQsIHtcblx0XHRcdFx0XHRcdGVycm9yczogW3tcblx0XHRcdFx0XHRcdFx0bWVzc2FnZTogJ0ludmFsaWQgbWVzc2FnZSB0eXBlLiBNZXNzYWdlIHR5cGUgbXVzdCBiZSBgc3Vic2NyaXB0aW9uX3N0YXJ0YCBvciBgc3Vic2NyaXB0aW9uX2VuZGAuJ1xuXHRcdFx0XHRcdFx0fV1cblx0XHRcdFx0XHR9KVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuIl19