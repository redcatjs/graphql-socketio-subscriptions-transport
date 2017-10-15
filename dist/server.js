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
									_this2.sendSubscriptionSuccess(answer, id);
									_context.next = 18;
									break;

								case 13:
									_context.prev = 13;
									_context.t1 = _context['catch'](5);
									errors = _context.t1.errors;
									message = _context.t1.message;

									if (errors) {
										_this2.sendSubscriptionFail(answer, id, { errors: errors });
									} else {
										_this2.sendSubscriptionFail(answer, id, { errors: [{ message: message }] });
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
									_this2.sendSubscriptionFail(answer, id, {
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

				return function (_x, _x2) {
					return _ref3.apply(this, arguments);
				};
			}();
		}
	}]);
	return Server;
}();

exports.default = Server;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2ZXIuanMiXSwibmFtZXMiOlsiU2VydmVyIiwicmVmIiwic2NoZW1hIiwicHVic3ViIiwiRXJyb3IiLCJ3cyIsInN1YnNjcmlwdGlvbk1hbmFnZXIiLCJvbiIsImhhbmRsZUNvbm5lY3Rpb24iLCJiaW5kIiwic29ja2V0IiwiaWQiLCJwYXlsb2FkIiwiZW1pdCIsImFuc3dlciIsInR5cGUiLCJjb25uZWN0aW9uU3Vic2NyaXB0aW9ucyIsIm9uTWVzc2FnZSIsIm9uQ2xvc2UiLCJmb3JFYWNoIiwic3ViSWQiLCJ1bnN1YnNjcmliZSIsInF1ZXJ5IiwidmFyaWFibGVzIiwib3BlcmF0aW9uTmFtZSIsInBhcmFtcyIsImNvbnRleHQiLCJmb3JtYXRSZXNwb25zZSIsInVuZGVmaW5lZCIsImZvcm1hdEVycm9yIiwiY2FsbGJhY2siLCJlcnJvciIsInJlc3VsdCIsInNlbmRTdWJzY3JpcHRpb25EYXRhIiwiZXJyb3JzIiwibWVzc2FnZSIsInN1YnNjcmliZSIsInNlbmRTdWJzY3JpcHRpb25TdWNjZXNzIiwic2VuZFN1YnNjcmlwdGlvbkZhaWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBRUE7Ozs7QUFFQTs7OztJQU9xQkEsTTtBQUNwQix1QkFBZ0NDLEdBQWhDLEVBQXFDO0FBQUEsTUFBdkJDLE1BQXVCLFFBQXZCQSxNQUF1QjtBQUFBLE1BQWZDLE1BQWUsUUFBZkEsTUFBZTtBQUFBOztBQUNwQyxNQUFJLGtCQUFKLEVBQTBCO0FBQ3pCLFNBQU0sSUFBSUMsS0FBSixDQUFVLHFFQUFWLENBQU47QUFDQTs7QUFFRCxPQUFLQyxFQUFMLEdBQVVKLEdBQVY7QUFDQSxPQUFLSyxtQkFBTCxHQUEyQixzQkFBd0IsRUFBRUosY0FBRixFQUFVQyxjQUFWLEVBQXhCLENBQTNCOztBQUVBLE9BQUtFLEVBQUwsQ0FBUUUsRUFBUixDQUFXLFlBQVgsRUFBeUIsS0FBS0MsZ0JBQUwsQ0FBc0JDLElBQXRCLENBQTJC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QUE4QmNDLGdCQTlCZCxlQThCY0EsT0E5QmQ7O0FBK0JILGFBQUlELE1BQUosRUFBWTtBQUNYLGlCQUFLSSxvQkFBTCxDQUEwQnhCLE1BQTFCLEVBQWtDSCxFQUFsQyxFQUFzQyxFQUFFdUIsY0FBRixFQUF0QztBQUNBLFVBRkQsTUFFTztBQUNOLGlCQUFLSSxvQkFBTCxDQUEwQnhCLE1BQTFCLEVBQWtDSCxFQUFsQyxFQUFzQyxFQUFFdUIsUUFBUSxDQUFDLEVBQUVDLGdCQUFGLEVBQUQsQ0FBVixFQUF0QztBQUNBOztBQW5DRTtBQUFBOztBQUFBO0FBd0NKLGFBQUksT0FBT25CLHdCQUF3QkwsRUFBeEIsQ0FBUCxLQUF1QyxXQUEzQyxFQUF3RDtBQUN2RCxpQkFBS0wsbUJBQUwsQ0FBeUJlLFdBQXpCLENBQXFDTCx3QkFBd0JMLEVBQXhCLENBQXJDO0FBQ0EsaUJBQU9LLHdCQUF3QkwsRUFBeEIsQ0FBUDtBQUNBOztBQTNDRzs7QUFBQTtBQStDSixnQkFBSzJCLG9CQUFMLENBQTBCeEIsTUFBMUIsRUFBa0NILEVBQWxDLEVBQXNDO0FBQ3JDdUIsa0JBQVEsQ0FBQztBQUNSQyxvQkFBUztBQURELFdBQUQ7QUFENkIsVUFBdEM7O0FBL0NJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQVA7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFzREE7Ozs7O2tCQXhHbUJuQyxNIiwiZmlsZSI6InNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVWRU5UX0tFWSB9IGZyb20gJy4vZGVmaW5pdGlvbnMnXG5cbmltcG9ydCBzdWJzY3JpcHRpb25NYW5hZ2VyIGZyb20gJy4vbWFuYWdlcidcblxuaW1wb3J0IHtcblx0U1VCU0NSSVBUSU9OX0ZBSUwsXG5cdFNVQlNDUklQVElPTl9TVEFSVCxcblx0U1VCU0NSSVBUSU9OX0VORCxcblx0U1VCU0NSSVBUSU9OX1NVQ0NFU1Ncbn0gZnJvbSAnLi9tZXNzYWdlVHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlcnZlciB7XG5cdGNvbnN0cnVjdG9yKHsgc2NoZW1hLCBwdWJzdWIgfSwgcmVmKSB7XG5cdFx0aWYgKCFzdWJzY3JpcHRpb25NYW5hZ2VyKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ011c3QgcHJvdmlkZSBgc3Vic2NyaXB0aW9uTWFuYWdlcmAgdG8gd2Vic29ja2V0IHNlcnZlciBjb25zdHJ1Y3Rvci4nKVxuXHRcdH1cblxuXHRcdHRoaXMud3MgPSByZWZcblx0XHR0aGlzLnN1YnNjcmlwdGlvbk1hbmFnZXIgPSBuZXcgc3Vic2NyaXB0aW9uTWFuYWdlcih7IHNjaGVtYSwgcHVic3ViIH0pXG5cdFx0XG5cdFx0dGhpcy53cy5vbignY29ubmVjdGlvbicsIHRoaXMuaGFuZGxlQ29ubmVjdGlvbi5iaW5kKHRoaXMpKVxuXHR9XG5cblx0c2VuZFN1YnNjcmlwdGlvbkRhdGEoc29ja2V0LCBpZCwgcGF5bG9hZCkge1xuXHRcdHNvY2tldC5lbWl0KEVWRU5UX0tFWSwge1xuXHRcdFx0aWQsXG5cdFx0XHRwYXlsb2FkXG5cdFx0fSlcblx0fVxuXG5cdHNlbmRTdWJzY3JpcHRpb25GYWlsKGFuc3dlciwgaWQsIHBheWxvYWQpIHtcblx0XHRhbnN3ZXIoe1xuXHRcdFx0dHlwZTogU1VCU0NSSVBUSU9OX0ZBSUwsXG5cdFx0XHRpZCxcblx0XHRcdHBheWxvYWRcblx0XHR9KVxuXHR9XG5cblx0c2VuZFN1YnNjcmlwdGlvblN1Y2Nlc3MoYW5zd2VyLCBpZCkge1xuXHRcdGFuc3dlcih7XG5cdFx0XHR0eXBlOiBTVUJTQ1JJUFRJT05fU1VDQ0VTUyxcblx0XHRcdGlkXG5cdFx0fSlcblx0fVxuXG5cdGhhbmRsZUNvbm5lY3Rpb24oc29ja2V0KSB7XG5cdFx0Y29uc3QgY29ubmVjdGlvblN1YnNjcmlwdGlvbnMgPSB7fVxuXHRcdHNvY2tldC5vbihFVkVOVF9LRVksIHRoaXMub25NZXNzYWdlKHNvY2tldCwgY29ubmVjdGlvblN1YnNjcmlwdGlvbnMpKVxuXHRcdHNvY2tldC5vbignZGlzY29ubmVjdCcsIHRoaXMub25DbG9zZShzb2NrZXQsIGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zKSlcblx0fVxuXG5cdG9uQ2xvc2Uoc29ja2V0LCBjb25uZWN0aW9uU3Vic2NyaXB0aW9ucykge1xuXHRcdHJldHVybiAoKSA9PiB7XG5cdFx0XHRPYmplY3Qua2V5cyhjb25uZWN0aW9uU3Vic2NyaXB0aW9ucykuZm9yRWFjaCggKHN1YklkKSA9PiB7XG5cdFx0XHRcdHRoaXMuc3Vic2NyaXB0aW9uTWFuYWdlci51bnN1YnNjcmliZShjb25uZWN0aW9uU3Vic2NyaXB0aW9uc1tzdWJJZF0pXG5cdFx0XHRcdGRlbGV0ZSBjb25uZWN0aW9uU3Vic2NyaXB0aW9uc1tzdWJJZF1cblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0b25NZXNzYWdlKHNvY2tldCwgY29ubmVjdGlvblN1YnNjcmlwdGlvbnMpIHtcblx0XHRyZXR1cm4gYXN5bmMgKHsgaWQsIHR5cGUsIHF1ZXJ5LCB2YXJpYWJsZXMsIG9wZXJhdGlvbk5hbWUgfSwgYW5zd2VyKSA9PiB7XG5cdFx0XHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRcdFx0Y2FzZSBTVUJTQ1JJUFRJT05fU1RBUlQ6XG5cdFx0XHRcdFx0Y29uc3QgcGFyYW1zID0ge1xuXHRcdFx0XHRcdFx0cXVlcnksXG5cdFx0XHRcdFx0XHR2YXJpYWJsZXMsXG5cdFx0XHRcdFx0XHRvcGVyYXRpb25OYW1lLFxuXHRcdFx0XHRcdFx0Y29udGV4dDoge30sXG5cdFx0XHRcdFx0XHRmb3JtYXRSZXNwb25zZTogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0Zm9ybWF0RXJyb3I6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdGNhbGxiYWNrOiAoZXJyb3IsIHJlc3VsdCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRpZiAoIWVycm9yKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5zZW5kU3Vic2NyaXB0aW9uRGF0YShzb2NrZXQsIGlkLCByZXN1bHQpXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoZXJyb3IuZXJyb3JzKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5zZW5kU3Vic2NyaXB0aW9uRGF0YShzb2NrZXQsIGlkLCB7IGVycm9yczogZXJyb3IuZXJyb3JzIH0pXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5zZW5kU3Vic2NyaXB0aW9uRGF0YShzb2NrZXQsIGlkLCB7IGVycm9yczogW3sgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9XSB9KVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zW2lkXSkge1xuXHRcdFx0XHRcdFx0dGhpcy5zdWJzY3JpcHRpb25NYW5hZ2VyLnVuc3Vic2NyaWJlKGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zW2lkXSlcblx0XHRcdFx0XHRcdGRlbGV0ZSBjb25uZWN0aW9uU3Vic2NyaXB0aW9uc1tpZF1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgc3ViSWQgPSBhd2FpdCB0aGlzLnN1YnNjcmlwdGlvbk1hbmFnZXIuc3Vic2NyaWJlKHBhcmFtcylcblx0XHRcdFx0XHRcdGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zW2lkXSA9IHN1YklkXG5cdFx0XHRcdFx0XHR0aGlzLnNlbmRTdWJzY3JpcHRpb25TdWNjZXNzKGFuc3dlciwgaWQpXG5cdFx0XHRcdFx0fSBjYXRjaCh7IGVycm9ycywgbWVzc2FnZSB9KSB7XG5cdFx0XHRcdFx0XHRpZiAoZXJyb3JzKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuc2VuZFN1YnNjcmlwdGlvbkZhaWwoYW5zd2VyLCBpZCwgeyBlcnJvcnMgfSlcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuc2VuZFN1YnNjcmlwdGlvbkZhaWwoYW5zd2VyLCBpZCwgeyBlcnJvcnM6IFt7IG1lc3NhZ2UgfV0gfSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIFNVQlNDUklQVElPTl9FTkQ6XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBjb25uZWN0aW9uU3Vic2NyaXB0aW9uc1tpZF0gIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnN1YnNjcmlwdGlvbk1hbmFnZXIudW5zdWJzY3JpYmUoY29ubmVjdGlvblN1YnNjcmlwdGlvbnNbaWRdKVxuXHRcdFx0XHRcdFx0ZGVsZXRlIGNvbm5lY3Rpb25TdWJzY3JpcHRpb25zW2lkXVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0dGhpcy5zZW5kU3Vic2NyaXB0aW9uRmFpbChhbnN3ZXIsIGlkLCB7XG5cdFx0XHRcdFx0XHRlcnJvcnM6IFt7XG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2U6ICdJbnZhbGlkIG1lc3NhZ2UgdHlwZS4gTWVzc2FnZSB0eXBlIG11c3QgYmUgYHN1YnNjcmlwdGlvbl9zdGFydGAgb3IgYHN1YnNjcmlwdGlvbl9lbmRgLidcblx0XHRcdFx0XHRcdH1dXG5cdFx0XHRcdFx0fSlcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiJdfQ==