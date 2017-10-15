'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _definitions = require('./definitions');

var _messageTypes = require('./messageTypes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Client = function () {
	function Client(ref) {
		var _this = this;

		(0, _classCallCheck3.default)(this, Client);

		this.ws = ref;
		this.subscriptions = {};
		this.maxId = 0;
		this.reconnectSubscriptions = {};
		this.unsentMessagesQueue = [];
		this.reconnecting = false;

		this.ws.on(_definitions.EVENT_KEY, this.handleData.bind(this));

		this.ws.on('connect', function () {
			_this.sendUnsentMessages();
		});

		this.ws.on('reconnect_attempt', function () {
			if (!_this.reconnecting) {
				_this.reconnectSubscriptions = _this.subscriptions;
				_this.subscriptions = {};
				_this.reconnecting = true;
			}
		});

		this.ws.on('reconnect', function () {
			_this.reconnecting = false;

			(0, _keys2.default)(_this.reconnectSubscriptions).forEach(function (key) {
				var _reconnectSubscriptio = _this.reconnectSubscriptions[key],
				    options = _reconnectSubscriptio.options,
				    handler = _reconnectSubscriptio.handler;


				_this.subscribe(options, handler);
			});

			_this.sendUnsentMessages();
		});
	}

	(0, _createClass3.default)(Client, [{
		key: 'handleData',
		value: function handleData(_ref) {
			var id = _ref.id,
			    payload = _ref.payload;

			if (payload.data && !payload.errors) {
				this.subscriptions[id].handler(null, payload.data);
			} else {
				this.subscriptions[id].handler(this.formatErrors(payload.errors), null);
			}
		}
	}, {
		key: 'formatErrors',
		value: function formatErrors(errors) {
			if (Array.isArray(errors)) {
				return errors;
			}
			if (errors && errors.message) {
				return [errors];
			}

			return [{ message: 'Unknown error' }];
		}
	}, {
		key: 'generateSubscriptionId',
		value: function generateSubscriptionId() {
			var id = this.maxId;
			this.maxId += 1;
			return id;
		}
	}, {
		key: 'emit',
		value: function emit(message, answer) {
			this.ws.emit(_definitions.EVENT_KEY, message, answer);
		}
	}, {
		key: 'sendUnsentMessages',
		value: function sendUnsentMessages() {
			var _this2 = this;

			this.unsentMessagesQueue.forEach(function (arr) {
				_this2.emit(arr[0], function (_ref2) {
					var type = _ref2.type,
					    id = _ref2.id,
					    payload = _ref2.payload;

					if (arr[1]) {
						arr[1](payload);
					}
				});
			});

			this.unsentMessagesQueue = [];
		}
	}, {
		key: 'sendMessage',
		value: function sendMessage(message, answer) {
			var _this3 = this;

			switch (this.ws.io.readyState) {
				case 'opening':
					this.unsentMessagesQueue.push([message, answer]);

					break;
				case 'open':
					this.emit(message, function (_ref3) {
						var type = _ref3.type,
						    id = _ref3.id,
						    payload = _ref3.payload;

						switch (type) {
							case _messageTypes.SUBSCRIPTION_SUCCESS:
								_this3.subscriptions[id].pending = false;
								break;
							case _messageTypes.SUBSCRIPTION_FAIL:
								_this3.subscriptions[id].handler(_this3.formatErrors(payload.errors), null);
								delete _this3.subscriptions[id];
								break;
						}
						if (answer) {
							answer(payload);
						}
					});
					break;
				default:
					if (this.reconnecting) {
						this.unsentMessagesQueue.push([message, answer]);
					} else {
						throw new Error('Client is not connected to a websocket.');
					}
					break;
			}
		}
	}, {
		key: 'subscribe',
		value: function subscribe(options, handler, answer) {
			var query = options.query,
			    variables = options.variables,
			    operationName = options.operationName,
			    context = options.context;


			if (!query) {
				throw new Error('Must provide `query` to subscribe.');
			}

			if (!handler) {
				throw new Error('Must provide `handler` to subscribe.');
			}

			if (typeof query !== 'string' || operationName && typeof operationName !== 'string' || variables && !(variables instanceof Object)) {
				throw new Error('Incorrect option types to subscribe. `subscription` must be a string,' + '`operationName` must be a string, and `variables` must be an object.');
			}

			var subId = this.generateSubscriptionId();

			var message = (0, _assign2.default)(options, {
				type: _messageTypes.SUBSCRIPTION_START,
				id: subId
			});

			this.sendMessage(message, answer);
			this.subscriptions[subId] = { options: options, handler: handler, pending: true };

			return subId;
		}
	}, {
		key: 'unsubscribe',
		value: function unsubscribe(id) {
			delete this.subscriptions[id];

			this.sendMessage({ id: id, type: _messageTypes.SUBSCRIPTION_END });
		}
	}, {
		key: 'unsubscribeAll',
		value: function unsubscribeAll() {
			var _this4 = this;

			(0, _keys2.default)(this.subscriptions).forEach(function (subId) {
				return _this4.unsubscribe(parseInt(subId));
			});
		}
	}]);
	return Client;
}();

exports.default = Client;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQuanMiXSwibmFtZXMiOlsiQ2xpZW50IiwicmVmIiwid3MiLCJzdWJzY3JpcHRpb25zIiwibWF4SWQiLCJyZWNvbm5lY3RTdWJzY3JpcHRpb25zIiwidW5zZW50TWVzc2FnZXNRdWV1ZSIsInJlY29ubmVjdGluZyIsIm9uIiwiaGFuZGxlRGF0YSIsImJpbmQiLCJzZW5kVW5zZW50TWVzc2FnZXMiLCJmb3JFYWNoIiwia2V5Iiwib3B0aW9ucyIsImhhbmRsZXIiLCJzdWJzY3JpYmUiLCJpZCIsInBheWxvYWQiLCJkYXRhIiwiZXJyb3JzIiwiZm9ybWF0RXJyb3JzIiwiQXJyYXkiLCJpc0FycmF5IiwibWVzc2FnZSIsImFuc3dlciIsImVtaXQiLCJhcnIiLCJ0eXBlIiwiaW8iLCJyZWFkeVN0YXRlIiwicHVzaCIsInBlbmRpbmciLCJFcnJvciIsInF1ZXJ5IiwidmFyaWFibGVzIiwib3BlcmF0aW9uTmFtZSIsImNvbnRleHQiLCJPYmplY3QiLCJzdWJJZCIsImdlbmVyYXRlU3Vic2NyaXB0aW9uSWQiLCJzZW5kTWVzc2FnZSIsInVuc3Vic2NyaWJlIiwicGFyc2VJbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFFQTs7OztJQU9xQkEsTTtBQUNwQixpQkFBWUMsR0FBWixFQUFpQjtBQUFBOztBQUFBOztBQUNoQixPQUFLQyxFQUFMLEdBQVVELEdBQVY7QUFDQSxPQUFLRSxhQUFMLEdBQXFCLEVBQXJCO0FBQ0EsT0FBS0MsS0FBTCxHQUFhLENBQWI7QUFDQSxPQUFLQyxzQkFBTCxHQUE4QixFQUE5QjtBQUNBLE9BQUtDLG1CQUFMLEdBQTJCLEVBQTNCO0FBQ0EsT0FBS0MsWUFBTCxHQUFvQixLQUFwQjs7QUFFQSxPQUFLTCxFQUFMLENBQVFNLEVBQVIseUJBQXNCLEtBQUtDLFVBQUwsQ0FBZ0JDLElBQWhCLENBQXFCLElBQXJCLENBQXRCOztBQUVBLE9BQUtSLEVBQUwsQ0FBUU0sRUFBUixDQUFXLFNB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Q0csT0FBT0MsS0FBUCxLQUFpQixRQUFuQixJQUNFRSxpQkFBa0IsT0FBT0EsYUFBUCxLQUF5QixRQUQ3QyxJQUVFRCxhQUFhLEVBQUVBLHFCQUFxQkcsTUFBdkIsQ0FIaEIsRUFJRTtBQUNELFVBQU0sSUFBSUwsS0FBSixDQUFVLDBFQUNoQixzRUFETSxDQUFOO0FBRUE7O0FBRUQsT0FBTU0sUUFBUSxLQUFLQyxzQkFBTCxFQUFkOztBQUVBLE9BQU1oQixVQUFVLHNCQUFjVixPQUFkLEVBQXVCO0FBQ3RDYywwQ0FEc0M7QUFFdENYLFFBQUlzQjtBQUZrQyxJQUF2QixDQUFoQjs7QUFLQSxRQUFLRSxXQUFMLENBQWlCakIsT0FBakIsRUFBMEJDLE1BQTFCO0FBQ0EsUUFBS3RCLGFBQUwsQ0FBbUJvQyxLQUFuQixJQUE0QixFQUFFekIsZ0JBQUYsRUFBV0MsZ0JBQVgsRUFBb0JpQixTQUFTLElBQTdCLEVBQTVCOztBQUVBLFVBQU9PLEtBQVA7QUFDQTs7OzhCQUVXdEIsRSxFQUFJO0FBQ2YsVUFBTyxLQUFLZCxhQUFMLENBQW1CYyxFQUFuQixDQUFQOztBQUVBLFFBQUt3QixXQUFMLENBQWlCLEVBQUV4QixNQUFGLEVBQU1XLG9DQUFOLEVBQWpCO0FBQ0E7OzttQ0FFZ0I7QUFBQTs7QUFDaEIsdUJBQVksS0FBS3pCLGFBQWpCLEVBQWdDUyxPQUFoQyxDQUF3QztBQUFBLFdBQVMsT0FBSzhCLFdBQUwsQ0FBaUJDLFNBQVNKLEtBQVQsQ0FBakIsQ0FBVDtBQUFBLElBQXhDO0FBQ0E7Ozs7O2tCQXhKbUJ2QyxNIiwiZmlsZSI6ImNsaWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVWRU5UX0tFWSB9IGZyb20gJy4vZGVmaW5pdGlvbnMnXG5cbmltcG9ydCB7XG5cdFNVQlNDUklQVElPTl9GQUlMLFxuXHRTVUJTQ1JJUFRJT05fU1RBUlQsXG5cdFNVQlNDUklQVElPTl9TVUNDRVNTLFxuXHRTVUJTQ1JJUFRJT05fRU5EXG59IGZyb20gJy4vbWVzc2FnZVR5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbGllbnQge1xuXHRjb25zdHJ1Y3RvcihyZWYpIHtcblx0XHR0aGlzLndzID0gcmVmXG5cdFx0dGhpcy5zdWJzY3JpcHRpb25zID0ge31cblx0XHR0aGlzLm1heElkID0gMFxuXHRcdHRoaXMucmVjb25uZWN0U3Vic2NyaXB0aW9ucyA9IHt9XG5cdFx0dGhpcy51bnNlbnRNZXNzYWdlc1F1ZXVlID0gW11cblx0XHR0aGlzLnJlY29ubmVjdGluZyA9IGZhbHNlXG5cblx0XHR0aGlzLndzLm9uKEVWRU5UX0tFWSwgdGhpcy5oYW5kbGVEYXRhLmJpbmQodGhpcykpXG5cblx0XHR0aGlzLndzLm9uKCdjb25uZWN0JywgKCkgPT4ge1xuXHRcdFx0dGhpcy5zZW5kVW5zZW50TWVzc2FnZXMoKVxuXHRcdH0pXG5cblx0XHR0aGlzLndzLm9uKCdyZWNvbm5lY3RfYXR0ZW1wdCcsICgpID0+IHtcblx0XHRcdGlmICghdGhpcy5yZWNvbm5lY3RpbmcpIHtcblx0XHRcdFx0dGhpcy5yZWNvbm5lY3RTdWJzY3JpcHRpb25zID0gdGhpcy5zdWJzY3JpcHRpb25zXG5cdFx0XHRcdHRoaXMuc3Vic2NyaXB0aW9ucyA9IHt9XG5cdFx0XHRcdHRoaXMucmVjb25uZWN0aW5nID0gdHJ1ZVxuXHRcdFx0fVxuXHRcdH0pXG5cblx0XHR0aGlzLndzLm9uKCdyZWNvbm5lY3QnLCAoKSA9PiB7XG5cdFx0XHR0aGlzLnJlY29ubmVjdGluZyA9IGZhbHNlXG5cblx0XHRcdE9iamVjdC5rZXlzKHRoaXMucmVjb25uZWN0U3Vic2NyaXB0aW9ucykuZm9yRWFjaCgoa2V5KSA9PiB7XG5cdFx0XHRcdGNvbnN0IHsgb3B0aW9ucywgaGFuZGxlciB9ID0gdGhpcy5yZWNvbm5lY3RTdWJzY3JpcHRpb25zW2tleV1cblxuXHRcdFx0XHR0aGlzLnN1YnNjcmliZShvcHRpb25zLCBoYW5kbGVyKVxuXHRcdFx0fSlcblxuXHRcdFx0dGhpcy5zZW5kVW5zZW50TWVzc2FnZXMoKVxuXHRcdH0pXG5cdH1cblxuXHRoYW5kbGVEYXRhKHsgaWQsIHBheWxvYWQgfSkge1xuXHRcdGlmIChwYXlsb2FkLmRhdGEgJiYgIXBheWxvYWQuZXJyb3JzKSB7XG5cdFx0XHR0aGlzLnN1YnNjcmlwdGlvbnNbaWRdLmhhbmRsZXIobnVsbCwgcGF5bG9hZC5kYXRhKVxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuc3Vic2NyaXB0aW9uc1tpZF0uaGFuZGxlcih0aGlzLmZvcm1hdEVycm9ycyhwYXlsb2FkLmVycm9ycyksIG51bGwpXG5cdFx0fVxuXHR9XG5cblx0Zm9ybWF0RXJyb3JzKGVycm9ycykge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KGVycm9ycykpIHtcblx0XHRcdHJldHVybiBlcnJvcnNcblx0XHR9XG5cdFx0aWYgKGVycm9ycyAmJiBlcnJvcnMubWVzc2FnZSkge1xuXHRcdFx0cmV0dXJuIFtlcnJvcnNdXG5cdFx0fVxuXG5cdFx0cmV0dXJuIFt7IG1lc3NhZ2U6ICdVbmtub3duIGVycm9yJyB9XVxuXHR9XG5cblx0Z2VuZXJhdGVTdWJzY3JpcHRpb25JZCgpIHtcblx0XHRjb25zdCBpZCA9IHRoaXMubWF4SWRcblx0XHR0aGlzLm1heElkICs9IDFcblx0XHRyZXR1cm4gaWRcblx0fVxuXHRcblx0ZW1pdChtZXNzYWdlLCBhbnN3ZXIpe1xuXHRcdHRoaXMud3MuZW1pdChFVkVOVF9LRVksbWVzc2FnZSxhbnN3ZXIpO1xuXHR9XG5cdFxuXHRzZW5kVW5zZW50TWVzc2FnZXMoKSB7XG5cdFx0dGhpcy51bnNlbnRNZXNzYWdlc1F1ZXVlLmZvckVhY2goKGFycik9Pntcblx0XHRcdHRoaXMuZW1pdChhcnJbMF0sICh7dHlwZSwgaWQsIHBheWxvYWR9KT0+e1xuXHRcdFx0XHRpZihhcnJbMV0pe1xuXHRcdFx0XHRcdGFyclsxXShwYXlsb2FkKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLnVuc2VudE1lc3NhZ2VzUXVldWUgPSBbXTtcblx0fVxuXG5cdHNlbmRNZXNzYWdlKG1lc3NhZ2UsIGFuc3dlcikge1xuXHRcdHN3aXRjaCAodGhpcy53cy5pby5yZWFkeVN0YXRlKSB7XG5cdFx0XHRjYXNlICdvcGVuaW5nJzpcblx0XHRcdFx0dGhpcy51bnNlbnRNZXNzYWdlc1F1ZXVlLnB1c2goW21lc3NhZ2UsYW5zd2VyXSlcblxuXHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdvcGVuJzpcblx0XHRcdFx0dGhpcy5lbWl0KG1lc3NhZ2UsICh7dHlwZSwgaWQsIHBheWxvYWR9KT0+e1xuXHRcdFx0XHRcdHN3aXRjaCh0eXBlKXtcblx0XHRcdFx0XHRcdGNhc2UgU1VCU0NSSVBUSU9OX1NVQ0NFU1M6XG5cdFx0XHRcdFx0XHRcdHRoaXMuc3Vic2NyaXB0aW9uc1tpZF0ucGVuZGluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFNVQlNDUklQVElPTl9GQUlMOlxuXHRcdFx0XHRcdFx0XHR0aGlzLnN1YnNjcmlwdGlvbnNbaWRdLmhhbmRsZXIodGhpcy5mb3JtYXRFcnJvcnMocGF5bG9hZC5lcnJvcnMpLCBudWxsKTtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIHRoaXMuc3Vic2NyaXB0aW9uc1tpZF07XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYoYW5zd2VyKXtcblx0XHRcdFx0XHRcdGFuc3dlcihwYXlsb2FkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRpZiAodGhpcy5yZWNvbm5lY3RpbmcpIHtcblx0XHRcdFx0XHR0aGlzLnVuc2VudE1lc3NhZ2VzUXVldWUucHVzaChbbWVzc2FnZSxhbnN3ZXJdKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcignQ2xpZW50IGlzIG5vdCBjb25uZWN0ZWQgdG8gYSB3ZWJzb2NrZXQuJylcblx0XHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0c3Vic2NyaWJlKG9wdGlvbnMsIGhhbmRsZXIsIGFuc3dlcikge1xuXHRcdGNvbnN0IHsgcXVlcnksIHZhcmlhYmxlcywgb3BlcmF0aW9uTmFtZSwgY29udGV4dCB9ID0gb3B0aW9uc1xuXG5cdFx0aWYgKCFxdWVyeSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdNdXN0IHByb3ZpZGUgYHF1ZXJ5YCB0byBzdWJzY3JpYmUuJylcblx0XHR9XG5cblx0XHRpZiAoIWhhbmRsZXIpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignTXVzdCBwcm92aWRlIGBoYW5kbGVyYCB0byBzdWJzY3JpYmUuJylcblx0XHR9XG5cblx0XHRpZiAoXG5cdFx0XHQoIHR5cGVvZiBxdWVyeSAhPT0gJ3N0cmluZycgKSB8fFxuXHRcdFx0KCBvcGVyYXRpb25OYW1lICYmICh0eXBlb2Ygb3BlcmF0aW9uTmFtZSAhPT0gJ3N0cmluZycpICkgfHxcblx0XHRcdCggdmFyaWFibGVzICYmICEodmFyaWFibGVzIGluc3RhbmNlb2YgT2JqZWN0KSApXG5cdFx0KSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0luY29ycmVjdCBvcHRpb24gdHlwZXMgdG8gc3Vic2NyaWJlLiBgc3Vic2NyaXB0aW9uYCBtdXN0IGJlIGEgc3RyaW5nLCcgK1xuXHRcdFx0J2BvcGVyYXRpb25OYW1lYCBtdXN0IGJlIGEgc3RyaW5nLCBhbmQgYHZhcmlhYmxlc2AgbXVzdCBiZSBhbiBvYmplY3QuJylcblx0XHR9XG5cblx0XHRjb25zdCBzdWJJZCA9IHRoaXMuZ2VuZXJhdGVTdWJzY3JpcHRpb25JZCgpXG5cblx0XHRjb25zdCBtZXNzYWdlID0gT2JqZWN0LmFzc2lnbihvcHRpb25zLCB7XG5cdFx0XHR0eXBlOiBTVUJTQ1JJUFRJT05fU1RBUlQsXG5cdFx0XHRpZDogc3ViSWRcblx0XHR9KVxuXG5cdFx0dGhpcy5zZW5kTWVzc2FnZShtZXNzYWdlLCBhbnN3ZXIpXG5cdFx0dGhpcy5zdWJzY3JpcHRpb25zW3N1YklkXSA9IHsgb3B0aW9ucywgaGFuZGxlciwgcGVuZGluZzogdHJ1ZSB9XG5cblx0XHRyZXR1cm4gc3ViSWRcblx0fVxuXG5cdHVuc3Vic2NyaWJlKGlkKSB7XG5cdFx0ZGVsZXRlIHRoaXMuc3Vic2NyaXB0aW9uc1tpZF1cblxuXHRcdHRoaXMuc2VuZE1lc3NhZ2UoeyBpZCwgdHlwZTogU1VCU0NSSVBUSU9OX0VORCB9KVxuXHR9XG5cblx0dW5zdWJzY3JpYmVBbGwoKSB7XG5cdFx0T2JqZWN0LmtleXModGhpcy5zdWJzY3JpcHRpb25zKS5mb3JFYWNoKHN1YklkID0+IHRoaXMudW5zdWJzY3JpYmUocGFyc2VJbnQoc3ViSWQpKSlcblx0fVxuXHRcblx0XG59XG4iXX0=