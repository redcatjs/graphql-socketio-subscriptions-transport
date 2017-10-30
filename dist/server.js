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
				id: id,
				payload: payload
			});
		}
	}, {
		key: 'sendSubscriptionFail',
		value: function sendSubscriptionFail(answer, id, payload) {
			answer({
				type: _messageTypes.SUBSCRIPTION_FAIL,
				id: id,
				payload: payload
			});
		}
	}, {
		key: 'sendSubscriptionSuccess',
		value: function sendSubscriptionSuccess(answer, id) {
			answer({
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
				var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2, answer) {
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
									_context.next = _context.t0 === _messageTypes.SUBSCRIPTION_START ? 3 : _context.t0 === _messageTypes.SUBSCRIPTION_END ? 18 : 20;
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
									_this2.sendSubscriptionSuccess(answer, id);
									_context.next = 17;
									break;

								case 13:
									_context.prev = 13;
									_context.t1 = _context['catch'](5);
									errors = _context.t1.errors, message = _context.t1.message;

									if (errors) {
										_this2.sendSubscriptionFail(answer, id, { errors: errors });
									} else if (message) {
										_this2.sendSubscriptionFail(answer, id, { errors: [{ message: message }] });
									} else {
										_this2.sendSubscriptionFail(answer, id, { errors: _context.t1 });
									}

								case 17:
									return _context.abrupt('break', 21);

								case 18:
									if (typeof connectionSubscriptions[id] !== 'undefined') {
										_this2.subscriptionManager.unsubscribe(connectionSubscriptions[id]);
										delete connectionSubscriptions[id];
									}

									return _context.abrupt('break', 21);

								case 20:
									_this2.sendSubscriptionFail(answer, id, {
										errors: [{
											message: 'Invalid message type. Message type must be `subscription_start` or `subscription_end`.'
										}]
									});

								case 21:
								case 'end':
									return _context.stop();
							}
						}
					}, _callee, _this2, [[5, 13]]);
				}));

				return function (_x, _x2) {
					return _ref3.apply(this, arguments);
				};
			}();
		}
	}]);
	return Server;
}();

exports.default = Server;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2ZXIuanMiXSwibmFtZXMiOlsiU2VydmVyIiwicmVmIiwic2NoZW1hIiwicHVic3ViIiwiRXJyb3IiLCJ3cyIsInN1YnNjcmlwdGlvbk1hbmFnZXIiLCJvbiIsImhhbmRsZUNvbm5lY3Rpb24iLCJiaW5kIiwic29ja2V0IiwiaWQiLCJwYXlsb2FkIiwiZW1pdCIsImFuc3dlciIsInR5cGUiLCJjb25uZWN0aW9uU3Vic2NyaXB0aW9ucyIsIm9uTWVzc2FnZSIsIm9uQ2xvc2UiLCJmb3JFYWNoIiwic3ViSWQiLCJ1bnN1YnNjcmliZSIsInF1ZXJ5IiwidmFyaWFibGVzIiwib3BlcmF0aW9uTmFtZSIsInBhcmFtcyIsImNvbnRleHQiLCJmb3JtYXRSZXNwb25zZSIsInVuZGVmaW5lZCIsImZvcm1hdEVycm9yIiwiY2FsbGJhY2siLCJlcnJvciIsInJlc3VsdCIsInNlbmRTdWJzY3JpcHRpb25EYXRhIiwiZXJyb3JzIiwibWVzc2FnZSIsInN1YnNjcmliZSIsInNlbmRTdWJzY3JpcHRpb25TdWNjZXNzIiwic2VuZFN1YnNjcmlwdGlvbkZhaWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBRUE7Ozs7QUFFQTs7OztJQU9xQkEsTTtBQUNwQix1QkFBZ0NDLEdBQWhDLEVBQXFDO0FBQUEsTUFBdkJDLE1BQXVCLFFBQXZCQSxNQUF1QjtBQUFBLE1BQWZDLE1BQWUsUUFBZkEsTUFBZTtBQUFBOztBQUNwQyxNQUFJLGtCQUFKLEVBQTBCO0FBQ3pCLFNBQU0sSUFBSUMsS0FBSixDQUFVLHFFQUFWLENBQU47QUFDQTs7QUFFRCxPQUFLQyxFQUFMLEdBQVVKLEdBQVY7QUFDQSxPQUFLSyxtQkFBTCxHQUEyQixzQkFBd0IsRUFBRUosY0FBRixFQUFVQyxjQUFWLEVBQXhCLENBQTNCOztBQUVBLE9BQUtFLEVBQUwsQ0FBUUUsRUFBUixDQUFXLFlBQVgsRUFBeUIsS0FBS0MsZ0JBQUwsQ0FBc0JDLElBQXRCLENBQTJC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RUErQmFDLE9BL0JiLGVBK0JhQSxPQS9CYjs7QUFnQ0gsYUFBSUQsTUFBSixFQUFZO0FBQ1gsaUJBQUtJLG9CQUFMLENBQTBCeEIsTUFBMUIsRUFBa0NILEVBQWxDLEVBQXNDLEVBQUV1QixjQUFGLEVBQXRDO0FBQ0EsVUFGRCxNQUdLLElBQUdDLE9BQUgsRUFBWTtBQUNoQixpQkFBS0csb0JBQUwsQ0FBMEJ4QixNQUExQixFQUFrQ0gsRUFBbEMsRUFBc0MsRUFBRXVCLFFBQVEsQ0FBQyxFQUFFQyxnQkFBRixFQUFELENBQVYsRUFBdEM7QUFDQSxVQUZJLE1BR0Q7QUFDSCxpQkFBS0csb0JBQUwsQ0FBMEJ4QixNQUExQixFQUFrQ0gsRUFBbEMsRUFBc0MsRUFBRXVCLG1CQUFGLEVBQXRDO0FBQ0E7O0FBeENFO0FBQUE7O0FBQUE7QUE2Q0osYUFBSSxPQUFPbEIsd0JBQXdCTCxFQUF4QixDQUFQLEtBQXVDLFdBQTNDLEVBQXdEO0FBQ3ZELGlCQUFLTCxtQkFBTCxDQUF5QmUsV0FBekIsQ0FBcUNMLHdCQUF3QkwsRUFBeEIsQ0FBckM7QUFDQSxpQkFBT0ssd0JBQXdCTCxFQUF4QixDQUFQO0FBQ0E7O0FBaERHOztBQUFBO0FBb0RKLGdCQUFLMkIsb0JBQUwsQ0FBMEJ4QixNQUExQixFQUFrQ0gsRUFBbEMsRUFBc0M7QUFDckN1QixrQkFBUSxDQUFDO0FBQ1JDLG9CQUFTO0FBREQsV0FBRDtBQUQ2QixVQUF0Qzs7QUFwREk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBUDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQTJEQTs7Ozs7a0JBN0dtQm5DLE0iLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRVZFTlRfS0VZIH0gZnJvbSAnLi9kZWZpbml0aW9ucydcblxuaW1wb3J0IHN1YnNjcmlwdGlvbk1hbmFnZXIgZnJvbSAnLi9tYW5hZ2VyJ1xuXG5pbXBvcnQge1xuXHRTVUJTQ1JJUFRJT05fRkFJTCxcblx0U1VCU0NSSVBUSU9OX1NUQVJULFxuXHRTVUJTQ1JJUFRJT05fRU5ELFxuXHRTVUJTQ1JJUFRJT05fU1VDQ0VTU1xufSBmcm9tICcuL21lc3NhZ2VUeXBlcydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VydmVyIHtcblx0Y29uc3RydWN0b3IoeyBzY2hlbWEsIHB1YnN1YiB9LCByZWYpIHtcblx0XHRpZiAoIXN1YnNjcmlwdGlvbk1hbmFnZXIpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignTXVzdCBwcm92aWRlIGBzdWJzY3JpcHRpb25NYW5hZ2VyYCB0byB3ZWJzb2NrZXQgc2VydmVyIGNvbnN0cnVjdG9yLicpXG5cdFx0fVxuXG5cdFx0dGhpcy53cyA9IHJlZlxuXHRcdHRoaXMuc3Vic2NyaXB0aW9uTWFuYWdlciA9IG5ldyBzdWJzY3JpcHRpb25NYW5hZ2VyKHsgc2NoZW1hLCBwdWJzdWIgfSlcblx0XHRcblx0XHR0aGlzLndzLm9uKCdjb25uZWN0aW9uJywgdGhpcy5oYW5kbGVDb25uZWN0aW9uLmJpbmQodGhpcykpXG5cdH1cblxuXHRzZW5kU3Vic2NyaXB0aW9uRGF0YShzb2NrZXQsIGlkLCBwYXlsb2FkKSB7XG5cdFx0c29ja2V0LmVtaXQoRVZFTlRfS0VZLCB7XG5cdFx0XHRpZCxcblx0XHRcdHBheWxvYWRcblx0XHR9KVxuXHR9XG5cblx0c2VuZFN1YnNjcmlwdGlvbkZhaWwoYW5zd2VyLCBpZCwgcGF5bG9hZCkge1xuXHRcdGFuc3dlcih7XG5cdFx0XHR0eXBlOiBTVUJTQ1JJUFRJT05fRkFJTCxcblx0XHRcdGlkLFxuXHRcdFx0cGF5bG9hZFxuXHRcdH0pXG5cdH1cblxuXHRzZW5kU3Vic2NyaXB0aW9uU3VjY2VzcyhhbnN3ZXIsIGlkKSB7XG5cdFx0YW5zd2VyKHtcblx0XHRcdHR5cGU6IFNVQlNDUklQVElPTl9TVUNDRVNTLFxuXHRcdFx0aWRcblx0XHR9KVxuXHR9XG5cblx0aGFuZGxlQ29ubmVjdGlvbihzb2NrZXQpIHtcblx0XHRjb25zdCBjb25uZWN0aW9uU3Vic2NyaXB0aW9ucyA9IHt9XG5cdFx0c29ja2V0Lm9uKEVWRU5UX0tFWSwgdGhpcy5vbk1lc3NhZ2Uoc29ja2V0LCBjb25uZWN0aW9uU3Vic2NyaXB0aW9ucykpXG5cdFx0c29ja2V0Lm9uKCdkaXNjb25uZWN0JywgdGhpcy5vbkNsb3NlKHNvY2tldCwgY29ubmVjdGlvblN1YnNjcmlwdGlvbnMpKVxuXHR9XG5cblx0b25DbG9zZShzb2NrZXQsIGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zKSB7XG5cdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdE9iamVjdC5rZXlzKGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zKS5mb3JFYWNoKCAoc3ViSWQpID0+IHtcblx0XHRcdFx0dGhpcy5zdWJzY3JpcHRpb25NYW5hZ2VyLnVuc3Vic2NyaWJlKGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zW3N1YklkXSlcblx0XHRcdFx0ZGVsZXRlIGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zW3N1YklkXVxuXHRcdFx0fSlcblx0XHR9XG5cdH1cblxuXHRvbk1lc3NhZ2Uoc29ja2V0LCBjb25uZWN0aW9uU3Vic2NyaXB0aW9ucykge1xuXHRcdHJldHVybiBhc3luYyAoeyBpZCwgdHlwZSwgcXVlcnksIHZhcmlhYmxlcywgb3BlcmF0aW9uTmFtZSB9LCBhbnN3ZXIpID0+IHtcblx0XHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0XHRjYXNlIFNVQlNDUklQVElPTl9TVEFSVDpcblx0XHRcdFx0XHRjb25zdCBwYXJhbXMgPSB7XG5cdFx0XHRcdFx0XHRxdWVyeSxcblx0XHRcdFx0XHRcdHZhcmlhYmxlcyxcblx0XHRcdFx0XHRcdG9wZXJhdGlvbk5hbWUsXG5cdFx0XHRcdFx0XHRjb250ZXh0OiB7fSxcblx0XHRcdFx0XHRcdGZvcm1hdFJlc3BvbnNlOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRmb3JtYXRFcnJvcjogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0Y2FsbGJhY2s6IChlcnJvciwgcmVzdWx0KSA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmICghZXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnNlbmRTdWJzY3JpcHRpb25EYXRhKHNvY2tldCwgaWQsIHJlc3VsdClcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChlcnJvci5lcnJvcnMpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnNlbmRTdWJzY3JpcHRpb25EYXRhKHNvY2tldCwgaWQsIHsgZXJyb3JzOiBlcnJvci5lcnJvcnMgfSlcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnNlbmRTdWJzY3JpcHRpb25EYXRhKHNvY2tldCwgaWQsIHsgZXJyb3JzOiBbeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH1dIH0pXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoY29ubmVjdGlvblN1YnNjcmlwdGlvbnNbaWRdKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnN1YnNjcmlwdGlvbk1hbmFnZXIudW5zdWJzY3JpYmUoY29ubmVjdGlvblN1YnNjcmlwdGlvbnNbaWRdKVxuXHRcdFx0XHRcdFx0ZGVsZXRlIGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zW2lkXVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRjb25zdCBzdWJJZCA9IGF3YWl0IHRoaXMuc3Vic2NyaXB0aW9uTWFuYWdlci5zdWJzY3JpYmUocGFyYW1zKVxuXHRcdFx0XHRcdFx0Y29ubmVjdGlvblN1YnNjcmlwdGlvbnNbaWRdID0gc3ViSWRcblx0XHRcdFx0XHRcdHRoaXMuc2VuZFN1YnNjcmlwdGlvblN1Y2Nlc3MoYW5zd2VyLCBpZClcblx0XHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHsgZXJyb3JzLCBtZXNzYWdlIH0gPSBlO1xuXHRcdFx0XHRcdFx0aWYgKGVycm9ycykge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnNlbmRTdWJzY3JpcHRpb25GYWlsKGFuc3dlciwgaWQsIHsgZXJyb3JzIH0pXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmKG1lc3NhZ2UpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5zZW5kU3Vic2NyaXB0aW9uRmFpbChhbnN3ZXIsIGlkLCB7IGVycm9yczogW3sgbWVzc2FnZSB9XSB9KVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdFx0dGhpcy5zZW5kU3Vic2NyaXB0aW9uRmFpbChhbnN3ZXIsIGlkLCB7IGVycm9yczogZSB9KVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgU1VCU0NSSVBUSU9OX0VORDpcblx0XHRcdFx0XHRpZiAodHlwZW9mIGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zW2lkXSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdHRoaXMuc3Vic2NyaXB0aW9uTWFuYWdlci51bnN1YnNjcmliZShjb25uZWN0aW9uU3Vic2NyaXB0aW9uc1tpZF0pXG5cdFx0XHRcdFx0XHRkZWxldGUgY29ubmVjdGlvblN1YnNjcmlwdGlvbnNbaWRdXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0aGlzLnNlbmRTdWJzY3JpcHRpb25GYWlsKGFuc3dlciwgaWQsIHtcblx0XHRcdFx0XHRcdGVycm9yczogW3tcblx0XHRcdFx0XHRcdFx0bWVzc2FnZTogJ0ludmFsaWQgbWVzc2FnZSB0eXBlLiBNZXNzYWdlIHR5cGUgbXVzdCBiZSBgc3Vic2NyaXB0aW9uX3N0YXJ0YCBvciBgc3Vic2NyaXB0aW9uX2VuZGAuJ1xuXHRcdFx0XHRcdFx0fV1cblx0XHRcdFx0XHR9KVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuIl19