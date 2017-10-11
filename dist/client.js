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

		this.ws.on(_definitions.EVENT_KEY, this.handleMessage.bind(this));

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
		key: 'handleMessage',
		value: function handleMessage(_ref) {
			var id = _ref.id,
			    type = _ref.type,
			    payload = _ref.payload;

			switch (type) {
				case _messageTypes.SUBSCRIPTION_SUCCESS:
					this.subscriptions[id].pending = false;

					break;
				case _messageTypes.SUBSCRIPTION_FAIL:
					this.subscriptions[id].handler(this.formatErrors(payload.errors), null);
					delete this.subscriptions[id];

					break;
				case _messageTypes.SUBSCRIPTION_DATA:
					if (payload.data && !payload.errors) {
						this.subscriptions[id].handler(null, payload.data);
					} else {
						this.subscriptions[id].handler(this.formatErrors(payload.errors), null);
					}

					break;
				default:
					throw new Error('Invalid message type - must be of type `subscription_start` or `subscription_data`.');
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
		key: 'sendUnsentMessages',
		value: function sendUnsentMessages() {
			var _this2 = this;

			this.unsentMessagesQueue.forEach(function (message) {
				return _this2.ws.emit(_definitions.EVENT_KEY, message);
			});

			this.unsentMessagesQueue = [];
		}
	}, {
		key: 'sendMessage',
		value: function sendMessage(message) {
			switch (this.ws.io.readyState) {
				case 'opening':
					this.unsentMessagesQueue.push(message);

					break;
				case 'open':
					this.ws.emit(_definitions.EVENT_KEY, message);

					break;
				default:
					if (this.reconnecting) {
						this.unsentMessagesQueue.push(message);
					} else {
						throw new Error('Client is not connected to a websocket.');
					}

					break;
			}
		}
	}, {
		key: 'subscribe',
		value: function subscribe(options, handler) {
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

			this.sendMessage(message);
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
			var _this3 = this;

			(0, _keys2.default)(this.subscriptions).forEach(function (subId) {
				return _this3.unsubscribe(parseInt(subId));
			});
		}
	}]);
	return Client;
}();

exports.default = Client;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQuanMiXSwibmFtZXMiOlsiQ2xpZW50IiwicmVmIiwid3MiLCJzdWJzY3JpcHRpb25zIiwibWF4SWQiLCJyZWNvbm5lY3RTdWJzY3JpcHRpb25zIiwidW5zZW50TWVzc2FnZXNRdWV1ZSIsInJlY29ubmVjdGluZyIsIm9uIiwiaGFuZGxlTWVzc2FnZSIsImJpbmQiLCJzZW5kVW5zZW50TWVzc2FnZXMiLCJmb3JFYWNoIiwia2V5Iiwib3B0aW9ucyIsImhhbmRsZXIiLCJzdWJzY3JpYmUiLCJpZCIsInR5cGUiLCJwYXlsb2FkIiwicGVuZGluZyIsImZvcm1hdEVycm9ycyIsImVycm9ycyIsImRhdGEiLCJFcnJvciIsIkFycmF5IiwiaXNBcnJheSIsIm1lc3NhZ2UiLCJlbWl0IiwiaW8iLCJyZWFkeVN0YXRlIiwicHVzaCIsInF1ZXJ5IiwidmFyaWFibGVzIiwib3BlcmF0aW9uTmFtZSIsImNvbnRleHQiLCJPYmplY3QiLCJzdWJJZCIsImdlbmVyYXRlU3Vic2NyaXB0aW9uSWQiLCJzZW5kTWVzc2FnZSIsInVuc3Vic2NyaWJlIiwicGFyc2VJbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFFQTs7OztJQVFxQkEsTTtBQUNwQixpQkFBWUMsR0FBWixFQUFpQjtBQUFBOztBQUFBOztBQUNoQixPQUFLQyxFQUFMLEdBQVVELEdBQVY7QUFDQSxPQUFLRSxhQUFMLEdBQXFCLEVBQXJCO0FBQ0EsT0FBS0MsS0FBTCxHQUFhLENBQWI7QUFDQSxPQUFLQyxzQkFBTCxHQUE4QixFQUE5QjtBQUNBLE9BQUtDLG1CQUFMLEdBQTJCLEVBQTNCO0FBQ0EsT0FBS0MsWUFBTCxHQUFvQixLQUFwQjs7QUFFQSxPQUFLTCxFQUFMLENBQVFNLEVBQVIseUJBQXNCLEtBQUtDLGFBQUwsQ0FBbUJDLElBQW5CLENBQXdCLElBQXhCLENBQXRCOztBQUVBLE9BQUtSLEVBQUwsQ0FBUU0sRUFBUixDQUFXLFNBQVgsRUFBc0IsWUFB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RUEsVUFBT2lCLEtBQVA7QUFDQTs7OzhCQUVXcEIsRSxFQUFJO0FBQ2YsVUFBTyxLQUFLZCxhQUFMLENBQW1CYyxFQUFuQixDQUFQOztBQUVBLFFBQUtzQixXQUFMLENBQWlCLEVBQUV0QixNQUFGLEVBQU1DLG9DQUFOLEVBQWpCO0FBQ0E7OzttQ0FFZ0I7QUFBQTs7QUFDaEIsdUJBQVksS0FBS2YsYUFBakIsRUFBZ0NTLE9BQWhDLENBQXdDO0FBQUEsV0FBUyxPQUFLNEIsV0FBTCxDQUFpQkMsU0FBU0osS0FBVCxDQUFqQixDQUFUO0FBQUEsSUFBeEM7QUFDQTs7Ozs7a0JBbkptQnJDLE0iLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRVZFTlRfS0VZIH0gZnJvbSAnLi9kZWZpbml0aW9ucydcblxuaW1wb3J0IHtcblx0U1VCU0NSSVBUSU9OX0ZBSUwsXG5cdFNVQlNDUklQVElPTl9EQVRBLFxuXHRTVUJTQ1JJUFRJT05fU1RBUlQsXG5cdFNVQlNDUklQVElPTl9TVUNDRVNTLFxuXHRTVUJTQ1JJUFRJT05fRU5EXG59IGZyb20gJy4vbWVzc2FnZVR5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbGllbnQge1xuXHRjb25zdHJ1Y3RvcihyZWYpIHtcblx0XHR0aGlzLndzID0gcmVmXG5cdFx0dGhpcy5zdWJzY3JpcHRpb25zID0ge31cblx0XHR0aGlzLm1heElkID0gMFxuXHRcdHRoaXMucmVjb25uZWN0U3Vic2NyaXB0aW9ucyA9IHt9XG5cdFx0dGhpcy51bnNlbnRNZXNzYWdlc1F1ZXVlID0gW11cblx0XHR0aGlzLnJlY29ubmVjdGluZyA9IGZhbHNlXG5cblx0XHR0aGlzLndzLm9uKEVWRU5UX0tFWSwgdGhpcy5oYW5kbGVNZXNzYWdlLmJpbmQodGhpcykpXG5cblx0XHR0aGlzLndzLm9uKCdjb25uZWN0JywgKCkgPT4ge1xuXHRcdFx0dGhpcy5zZW5kVW5zZW50TWVzc2FnZXMoKVxuXHRcdH0pXG5cblx0XHR0aGlzLndzLm9uKCdyZWNvbm5lY3RfYXR0ZW1wdCcsICgpID0+IHtcblx0XHRcdGlmICghdGhpcy5yZWNvbm5lY3RpbmcpIHtcblx0XHRcdFx0dGhpcy5yZWNvbm5lY3RTdWJzY3JpcHRpb25zID0gdGhpcy5zdWJzY3JpcHRpb25zXG5cdFx0XHRcdHRoaXMuc3Vic2NyaXB0aW9ucyA9IHt9XG5cdFx0XHRcdHRoaXMucmVjb25uZWN0aW5nID0gdHJ1ZVxuXHRcdFx0fVxuXHRcdH0pXG5cblx0XHR0aGlzLndzLm9uKCdyZWNvbm5lY3QnLCAoKSA9PiB7XG5cdFx0XHR0aGlzLnJlY29ubmVjdGluZyA9IGZhbHNlXG5cblx0XHRcdE9iamVjdC5rZXlzKHRoaXMucmVjb25uZWN0U3Vic2NyaXB0aW9ucykuZm9yRWFjaCgoa2V5KSA9PiB7XG5cdFx0XHRcdGNvbnN0IHsgb3B0aW9ucywgaGFuZGxlciB9ID0gdGhpcy5yZWNvbm5lY3RTdWJzY3JpcHRpb25zW2tleV1cblxuXHRcdFx0XHR0aGlzLnN1YnNjcmliZShvcHRpb25zLCBoYW5kbGVyKVxuXHRcdFx0fSlcblxuXHRcdFx0dGhpcy5zZW5kVW5zZW50TWVzc2FnZXMoKVxuXHRcdH0pXG5cdH1cblxuXHRoYW5kbGVNZXNzYWdlKHsgaWQsIHR5cGUsIHBheWxvYWQgfSkge1xuXHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0Y2FzZSBTVUJTQ1JJUFRJT05fU1VDQ0VTUzpcblx0XHRcdFx0dGhpcy5zdWJzY3JpcHRpb25zW2lkXS5wZW5kaW5nID0gZmFsc2VcblxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBTVUJTQ1JJUFRJT05fRkFJTDpcblx0XHRcdFx0dGhpcy5zdWJzY3JpcHRpb25zW2lkXS5oYW5kbGVyKHRoaXMuZm9ybWF0RXJyb3JzKHBheWxvYWQuZXJyb3JzKSwgbnVsbClcblx0XHRcdFx0ZGVsZXRlIHRoaXMuc3Vic2NyaXB0aW9uc1tpZF1cblxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBTVUJTQ1JJUFRJT05fREFUQTpcblx0XHRcdFx0aWYgKHBheWxvYWQuZGF0YSAmJiAhcGF5bG9hZC5lcnJvcnMpIHtcblx0XHRcdFx0XHR0aGlzLnN1YnNjcmlwdGlvbnNbaWRdLmhhbmRsZXIobnVsbCwgcGF5bG9hZC5kYXRhKVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuc3Vic2NyaXB0aW9uc1tpZF0uaGFuZGxlcih0aGlzLmZvcm1hdEVycm9ycyhwYXlsb2FkLmVycm9ycyksIG51bGwpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRicmVha1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG1lc3NhZ2UgdHlwZSAtIG11c3QgYmUgb2YgdHlwZSBgc3Vic2NyaXB0aW9uX3N0YXJ0YCBvciBgc3Vic2NyaXB0aW9uX2RhdGFgLicpXG5cdFx0fVxuXHR9XG5cblx0Zm9ybWF0RXJyb3JzKGVycm9ycykge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KGVycm9ycykpIHtcblx0XHRcdHJldHVybiBlcnJvcnNcblx0XHR9XG5cdFx0aWYgKGVycm9ycyAmJiBlcnJvcnMubWVzc2FnZSkge1xuXHRcdFx0cmV0dXJuIFtlcnJvcnNdXG5cdFx0fVxuXG5cdFx0cmV0dXJuIFt7IG1lc3NhZ2U6ICdVbmtub3duIGVycm9yJyB9XVxuXHR9XG5cblx0Z2VuZXJhdGVTdWJzY3JpcHRpb25JZCgpIHtcblx0XHRjb25zdCBpZCA9IHRoaXMubWF4SWRcblx0XHR0aGlzLm1heElkICs9IDFcblx0XHRyZXR1cm4gaWRcblx0fVxuXG5cdHNlbmRVbnNlbnRNZXNzYWdlcygpIHtcblx0XHR0aGlzLnVuc2VudE1lc3NhZ2VzUXVldWUuZm9yRWFjaChcblx0XHRcdG1lc3NhZ2UgPT4gdGhpcy53cy5lbWl0KEVWRU5UX0tFWSwgbWVzc2FnZSlcblx0XHQpXG5cblx0XHR0aGlzLnVuc2VudE1lc3NhZ2VzUXVldWUgPSBbXVxuXHR9XG5cblx0c2VuZE1lc3NhZ2UobWVzc2FnZSkge1xuXHRcdHN3aXRjaCAodGhpcy53cy5pby5yZWFkeVN0YXRlKSB7XG5cdFx0XHRjYXNlICdvcGVuaW5nJzpcblx0XHRcdFx0dGhpcy51bnNlbnRNZXNzYWdlc1F1ZXVlLnB1c2gobWVzc2FnZSlcblxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnb3Blbic6XG5cdFx0XHRcdHRoaXMud3MuZW1pdChFVkVOVF9LRVksIG1lc3NhZ2UpXG5cblx0XHRcdFx0YnJlYWtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGlmICh0aGlzLnJlY29ubmVjdGluZykge1xuXHRcdFx0XHRcdHRoaXMudW5zZW50TWVzc2FnZXNRdWV1ZS5wdXNoKG1lc3NhZ2UpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdDbGllbnQgaXMgbm90IGNvbm5lY3RlZCB0byBhIHdlYnNvY2tldC4nKVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cdH1cblxuXHRzdWJzY3JpYmUob3B0aW9ucywgaGFuZGxlcikge1xuXHRcdGNvbnN0IHsgcXVlcnksIHZhcmlhYmxlcywgb3BlcmF0aW9uTmFtZSwgY29udGV4dCB9ID0gb3B0aW9uc1xuXG5cdFx0aWYgKCFxdWVyeSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdNdXN0IHByb3ZpZGUgYHF1ZXJ5YCB0byBzdWJzY3JpYmUuJylcblx0XHR9XG5cblx0XHRpZiAoIWhhbmRsZXIpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignTXVzdCBwcm92aWRlIGBoYW5kbGVyYCB0byBzdWJzY3JpYmUuJylcblx0XHR9XG5cblx0XHRpZiAoXG5cdFx0XHQoIHR5cGVvZiBxdWVyeSAhPT0gJ3N0cmluZycgKSB8fFxuXHRcdFx0KCBvcGVyYXRpb25OYW1lICYmICh0eXBlb2Ygb3BlcmF0aW9uTmFtZSAhPT0gJ3N0cmluZycpICkgfHxcblx0XHRcdCggdmFyaWFibGVzICYmICEodmFyaWFibGVzIGluc3RhbmNlb2YgT2JqZWN0KSApXG5cdFx0KSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0luY29ycmVjdCBvcHRpb24gdHlwZXMgdG8gc3Vic2NyaWJlLiBgc3Vic2NyaXB0aW9uYCBtdXN0IGJlIGEgc3RyaW5nLCcgK1xuXHRcdFx0J2BvcGVyYXRpb25OYW1lYCBtdXN0IGJlIGEgc3RyaW5nLCBhbmQgYHZhcmlhYmxlc2AgbXVzdCBiZSBhbiBvYmplY3QuJylcblx0XHR9XG5cblx0XHRjb25zdCBzdWJJZCA9IHRoaXMuZ2VuZXJhdGVTdWJzY3JpcHRpb25JZCgpXG5cblx0XHRjb25zdCBtZXNzYWdlID0gT2JqZWN0LmFzc2lnbihvcHRpb25zLCB7XG5cdFx0XHR0eXBlOiBTVUJTQ1JJUFRJT05fU1RBUlQsXG5cdFx0XHRpZDogc3ViSWRcblx0XHR9KVxuXG5cdFx0dGhpcy5zZW5kTWVzc2FnZShtZXNzYWdlKVxuXHRcdHRoaXMuc3Vic2NyaXB0aW9uc1tzdWJJZF0gPSB7IG9wdGlvbnMsIGhhbmRsZXIsIHBlbmRpbmc6IHRydWUgfVxuXG5cdFx0cmV0dXJuIHN1YklkXG5cdH1cblxuXHR1bnN1YnNjcmliZShpZCkge1xuXHRcdGRlbGV0ZSB0aGlzLnN1YnNjcmlwdGlvbnNbaWRdXG5cblx0XHR0aGlzLnNlbmRNZXNzYWdlKHsgaWQsIHR5cGU6IFNVQlNDUklQVElPTl9FTkQgfSlcblx0fVxuXG5cdHVuc3Vic2NyaWJlQWxsKCkge1xuXHRcdE9iamVjdC5rZXlzKHRoaXMuc3Vic2NyaXB0aW9ucykuZm9yRWFjaChzdWJJZCA9PiB0aGlzLnVuc3Vic2NyaWJlKHBhcnNlSW50KHN1YklkKSkpXG5cdH1cbn1cbiJdfQ==