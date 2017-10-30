'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _events = require('events');

var _graphql = require('graphql');

var _values = require('graphql/execution/values');

var _validation = require('./validation');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SubscriptionManager = function () {
	function SubscriptionManager(options) {
		(0, _classCallCheck3.default)(this, SubscriptionManager);

		this.pubsub = options.pubsub;
		this.schema = options.schema;
		this.setupFunctions = options.setupFunctions || {};
		this.subscriptions = {};
		this.maxSubscriptionId = 0;
	}

	(0, _createClass3.default)(SubscriptionManager, [{
		key: 'publish',
		value: function publish(triggerName, payload) {
			this.pubsub.publish(triggerName, payload);
		}
	}, {
		key: 'subscribe',
		value: function subscribe(options) {
			var _this = this;

			// 1. validate the query, operationName and variables
			var parsedQuery = (0, _graphql.parse)(options.query);
			var errors = (0, _graphql.validate)(this.schema, parsedQuery, [].concat((0, _toConsumableArray3.default)(_graphql.specifiedRules), [_validation.subscriptionHasSingleRootField]));

			// TODO: validate that all variables have been passed (and are of correct type)?
			if (errors.length) {
				// this error kills the subscription, so we throw it.
				return _promise2.default.reject(new ValidationError(errors));
			}

			var args = {};

			// operationName is the name of the only root field in the subscription document
			var subscriptionName = '';
			parsedQuery.definitions.forEach(function (definition) {
				if (definition.kind === 'OperationDefinition') {
					// only one root field is allowed on subscription. No fragments for now.
					var rootField = definition.selectionSet.selections[0];
					subscriptionName = rootField.name.value;

					var fields = _this.schema.getSubscriptionType().getFields();
					args = (0, _values.getArgumentValues)(fields[subscriptionName], rootField, options.variables);
				}
			});

			var triggerMap = void 0;

			if (this.setupFunctions[subscriptionName]) {
				triggerMap = this.setupFunctions[subscriptionName](options, args, subscriptionName);
			} else {
				// if not provided, the triggerName will be the subscriptionName, The trigger will not have any
				// options and rely on defaults that are set later.
				triggerMap = (0, _defineProperty3.default)({}, subscriptionName, {});
			}

			var externalSubscriptionId = this.maxSubscriptionId++;
			this.subscriptions[externalSubscriptionId] = [];
			var subscriptionPromises = [];
			(0, _keys2.default)(triggerMap).forEach(function (triggerName) {
				// Deconstruct the trigger options and set any defaults
				var _triggerMap$triggerNa = triggerMap[triggerName],
				    _triggerMap$triggerNa2 = _triggerMap$triggerNa.channelOptions,
				    channelOptions = _triggerMap$triggerNa2 === undefined ? {} : _triggerMap$triggerNa2,
				    _triggerMap$triggerNa3 = _triggerMap$triggerNa.filter,
				    filter = _triggerMap$triggerNa3 === undefined ? function () {
					return true;
				} : _triggerMap$triggerNa3;

				// 2. generate the handler function
				//
				// rootValue is the payload sent by the event emitter / trigger by
				// convention this is the value returned from the mutation
				// resolver

				var onMessage = function onMessage(rootValue) {
					return _promise2.default.resolve().then(function () {
						if (typeof options.context === 'function') {
							return options.context();
						}
						return options.context;
					}).then(function (context) {
						return _promise2.default.all([context, filter(rootValue, context)]);
					}).then(function (_ref) {
						var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
						    context = _ref2[0],
						    doExecute = _ref2[1];

						if (!doExecute) {
							return;
						}
						(0, _graphql.execute)(_this.schema, parsedQuery, rootValue, context, options.variables, options.operationName).then(function (data) {
							return options.callback(data.errors, data);
						});
					}).catch(function (error) {
						options.callback(error);
					});
				};

				// 3. subscribe and keep the subscription id
				subscriptionPromises.push(_this.pubsub.subscribe(triggerName, onMessage, channelOptions).then(function (id) {
					return _this.subscriptions[externalSubscriptionId].push(id);
				}));
			});

			// Resolve the promise with external sub id only after all subscriptions completed
			return _promise2.default.all(subscriptionPromises).then(function () {
				return externalSubscriptionId;
			});
		}
	}, {
		key: 'unsubscribe',
		value: function unsubscribe(subId) {
			var _this2 = this;

			// pass the subId right through to pubsub. Do nothing else.
			this.subscriptions[subId].forEach(function (internalId) {
				_this2.pubsub.unsubscribe(internalId);
			});
			delete this.subscriptions[subId];
		}
	}]);
	return SubscriptionManager;
}();

;

exports.default = SubscriptionManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tYW5hZ2VyLmpzIl0sIm5hbWVzIjpbIlN1YnNjcmlwdGlvbk1hbmFnZXIiLCJvcHRpb25zIiwicHVic3ViIiwic2NoZW1hIiwic2V0dXBGdW5jdGlvbnMiLCJzdWJzY3JpcHRpb25zIiwibWF4U3Vic2NyaXB0aW9uSWQiLCJ0cmlnZ2VyTmFtZSIsInBheWxvYWQiLCJwdWJsaXNoIiwicGFyc2VkUXVlcnkiLCJxdWVyeSIsImVycm9ycyIsImxlbmd0aCIsInJlamVjdCIsIlZhbGlkYXRpb25FcnJvciIsImFyZ3MiLCJzdWJzY3JpcHRpb25OYW1lIiwiZGVmaW5pdGlvbnMiLCJmb3JFYWNoIiwiZGVmaW5pdGlvbiIsImtpbmQiLCJyb290RmllbGQiLCJzZWxlY3Rpb25TZXQiLCJzZWxlY3Rpb25zIiwibmFtZSIsInZhbHVlIiwiZmllbGRzIiwiZ2V0U3Vic2NyaXB0aW9uVHlwZSIsImdldEZpZWxkcyIsInZhcmlhYmxlcyIsInRyaWdnZXJNYXAiLCJleHRlcm5hbFN1YnNjcmlwdGlvbklkIiwic3Vic2NyaXB0aW9uUHJvbWlzZXMiLCJjaGFubmVsT3B0aW9ucyIsImZpbHRlciIsIm9uTWVzc2FnZSIsInJvb3RWYWx1ZSIsInJlc29sdmUiLCJ0aGVuIiwiY29udGV4dCIsImFsbCIsImRvRXhlY3V0ZSIsIm9wZXJhdGlvbk5hbWUiLCJjYWxsYmFjayIsImRhdGEiLCJjYXRjaCIsImVycm9yIiwicHVzaCIsInN1YnNjcmliZSIsImlkIiwic3ViSWQiLCJ1bnN1YnNjcmliZSIsImludGVybmFsSWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFVQTs7QUFFQTs7OztJQUtNQSxtQjtBQUVMLDhCQUFZQyxPQUFaLEVBQW9CO0FBQUE7O0FBQ25CLE9BQUtDLE1BQUwsR0FBY0QsUUFBUUMsTUFBdEI7QUFDQSxPQUFLQyxNQUFMLEdBQWNGLFFBQVFFLE1BQXRCO0FBQ0EsT0FBS0MsY0FBTCxH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LEVBRUNPLFdBRkQsRUFHQzJCLFNBSEQsRUFJQ0csT0FKRCxFQUtDdkMsUUFBUTZCLFNBTFQsRUFNQzdCLFFBQVEwQyxhQU5ULEVBT0VKLElBUEYsQ0FPUSxnQkFBUTtBQUNoQixjQUFPdEMsUUFBUTJDLFFBQVIsQ0FBaUJDLEtBQUtqQyxNQUF0QixFQUE4QmlDLElBQTlCLENBQVA7QUFDQyxPQVREO0FBVUQsTUF4Qk0sRUF3QkpDLEtBeEJJLENBd0JFLFVBQUNDLEtBQUQsRUFBVztBQUNuQjlDLGNBQVEyQyxRQUFSLENBQWlCRyxLQUFqQjtBQUNBLE1BMUJNLENBQVA7QUEyQkEsS0E1QkQ7O0FBOEJBO0FBQ0FkLHlCQUFxQmUsSUFBckIsQ0FDQyxNQUFLOUMsTUFBTCxDQUFZK0MsU0FBWixDQUFzQjFDLFdBQXRCLEVBQW1DNkIsU0FBbkMsRUFBOENGLGNBQTlDLEVBQ0VLLElBREYsQ0FDTztBQUFBLFlBQU0sTUFBS2xDLGFBQUwsQ0FBbUIyQixzQkFBbkIsRUFBMkNnQixJQUEzQyxDQUFnREUsRUFBaEQsQ0FBTjtBQUFBLEtBRFAsQ0FERDtBQUlBLElBL0NEOztBQWlEQTtBQUNBLFVBQU8sa0JBQVFULEdBQVIsQ0FBWVIsb0JBQVosRUFBa0NNLElBQWxDLENBQXVDO0FBQUEsV0FBTVAsc0JBQU47QUFBQSxJQUF2QyxDQUFQO0FBQ0E7Ozs4QkFFV21CLEssRUFBTTtBQUFBOztBQUNqQjtBQUNBLFFBQUs5QyxhQUFMLENBQW1COEMsS0FBbkIsRUFBMEJoQyxPQUExQixDQUFtQyxzQkFBYztBQUNoRCxXQUFLakIsTUFBTCxDQUFZa0QsV0FBWixDQUF3QkMsVUFBeEI7QUFDQSxJQUZEO0FBR0EsVUFBTyxLQUFLaEQsYUFBTCxDQUFtQjhDLEtBQW5CLENBQVA7QUFDQTs7Ozs7QUFDRDs7a0JBRWNuRCxtQiIsImZpbGUiOiJtYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJ1xuaW1wb3J0IHtcblx0R3JhcGhRTFNjaGVtYSxcblx0R3JhcGhRTEVycm9yLFxuXHR2YWxpZGF0ZSxcblx0ZXhlY3V0ZSxcblx0cGFyc2UsXG5cdHNwZWNpZmllZFJ1bGVzLFxuXHRPcGVyYXRpb25EZWZpbml0aW9uLFxuXHRGaWVsZCxcbn0gZnJvbSAnZ3JhcGhxbCdcbmltcG9ydCB7IGdldEFyZ3VtZW50VmFsdWVzIH0gZnJvbSAnZ3JhcGhxbC9leGVjdXRpb24vdmFsdWVzJ1xuXG5pbXBvcnQge1xuXHRzdWJzY3JpcHRpb25IYXNTaW5nbGVSb290RmllbGQsXG59IGZyb20gJy4vdmFsaWRhdGlvbidcblxuXG5jbGFzcyBTdWJzY3JpcHRpb25NYW5hZ2VyIHtcblx0XG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMpe1xuXHRcdHRoaXMucHVic3ViID0gb3B0aW9ucy5wdWJzdWI7XG5cdFx0dGhpcy5zY2hlbWEgPSBvcHRpb25zLnNjaGVtYTtcblx0XHR0aGlzLnNldHVwRnVuY3Rpb25zID0gb3B0aW9ucy5zZXR1cEZ1bmN0aW9ucyB8fCB7fTtcblx0XHR0aGlzLnN1YnNjcmlwdGlvbnMgPSB7fTtcblx0XHR0aGlzLm1heFN1YnNjcmlwdGlvbklkID0gMDtcblx0fVxuXG5cdHB1Ymxpc2godHJpZ2dlck5hbWUsIHBheWxvYWQpe1xuXHRcdHRoaXMucHVic3ViLnB1Ymxpc2godHJpZ2dlck5hbWUsIHBheWxvYWQpO1xuXHR9XG5cblx0c3Vic2NyaWJlKG9wdGlvbnMpe1xuXG5cdFx0Ly8gMS4gdmFsaWRhdGUgdGhlIHF1ZXJ5LCBvcGVyYXRpb25OYW1lIGFuZCB2YXJpYWJsZXNcblx0XHRjb25zdCBwYXJzZWRRdWVyeSA9IHBhcnNlKG9wdGlvbnMucXVlcnkpO1xuXHRcdGNvbnN0IGVycm9ycyA9IHZhbGlkYXRlKFxuXHRcdFx0dGhpcy5zY2hlbWEsXG5cdFx0XHRwYXJzZWRRdWVyeSxcblx0XHRcdFsuLi5zcGVjaWZpZWRSdWxlcywgc3Vic2NyaXB0aW9uSGFzU2luZ2xlUm9vdEZpZWxkXVxuXHRcdCk7XG5cblx0XHQvLyBUT0RPOiB2YWxpZGF0ZSB0aGF0IGFsbCB2YXJpYWJsZXMgaGF2ZSBiZWVuIHBhc3NlZCAoYW5kIGFyZSBvZiBjb3JyZWN0IHR5cGUpP1xuXHRcdGlmIChlcnJvcnMubGVuZ3RoKXtcblx0XHRcdC8vIHRoaXMgZXJyb3Iga2lsbHMgdGhlIHN1YnNjcmlwdGlvbiwgc28gd2UgdGhyb3cgaXQuXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFZhbGlkYXRpb25FcnJvcihlcnJvcnMpKTtcblx0XHR9XG5cblx0XHRsZXQgYXJncyA9IHt9O1xuXG5cdFx0Ly8gb3BlcmF0aW9uTmFtZSBpcyB0aGUgbmFtZSBvZiB0aGUgb25seSByb290IGZpZWxkIGluIHRoZSBzdWJzY3JpcHRpb24gZG9jdW1lbnRcblx0XHRsZXQgc3Vic2NyaXB0aW9uTmFtZSA9ICcnO1xuXHRcdHBhcnNlZFF1ZXJ5LmRlZmluaXRpb25zLmZvckVhY2goIGRlZmluaXRpb24gPT4ge1xuXHRcdFx0aWYgKGRlZmluaXRpb24ua2luZCA9PT0gJ09wZXJhdGlvbkRlZmluaXRpb24nKXtcblx0XHRcdFx0Ly8gb25seSBvbmUgcm9vdCBmaWVsZCBpcyBhbGxvd2VkIG9uIHN1YnNjcmlwdGlvbi4gTm8gZnJhZ21lbnRzIGZvciBub3cuXG5cdFx0XHRcdGNvbnN0IHJvb3RGaWVsZCA9IChkZWZpbml0aW9uKS5zZWxlY3Rpb25TZXQuc2VsZWN0aW9uc1swXTtcblx0XHRcdFx0c3Vic2NyaXB0aW9uTmFtZSA9IHJvb3RGaWVsZC5uYW1lLnZhbHVlO1xuXG5cdFx0XHRcdGNvbnN0IGZpZWxkcyA9IHRoaXMuc2NoZW1hLmdldFN1YnNjcmlwdGlvblR5cGUoKS5nZXRGaWVsZHMoKTtcblx0XHRcdFx0YXJncyA9IGdldEFyZ3VtZW50VmFsdWVzKGZpZWxkc1tzdWJzY3JpcHRpb25OYW1lXSwgcm9vdEZpZWxkLCBvcHRpb25zLnZhcmlhYmxlcyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRsZXQgdHJpZ2dlck1hcDtcblxuXHRcdGlmICh0aGlzLnNldHVwRnVuY3Rpb25zW3N1YnNjcmlwdGlvbk5hbWVdKSB7XG5cdFx0XHR0cmlnZ2VyTWFwID0gdGhpcy5zZXR1cEZ1bmN0aW9uc1tzdWJzY3JpcHRpb25OYW1lXShvcHRpb25zLCBhcmdzLCBzdWJzY3JpcHRpb25OYW1lKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaWYgbm90IHByb3ZpZGVkLCB0aGUgdHJpZ2dlck5hbWUgd2lsbCBiZSB0aGUgc3Vic2NyaXB0aW9uTmFtZSwgVGhlIHRyaWdnZXIgd2lsbCBub3QgaGF2ZSBhbnlcblx0XHRcdC8vIG9wdGlvbnMgYW5kIHJlbHkgb24gZGVmYXVsdHMgdGhhdCBhcmUgc2V0IGxhdGVyLlxuXHRcdFx0dHJpZ2dlck1hcCA9IHtbc3Vic2NyaXB0aW9uTmFtZV06IHt9fTtcblx0XHR9XG5cblx0XHRjb25zdCBleHRlcm5hbFN1YnNjcmlwdGlvbklkID0gdGhpcy5tYXhTdWJzY3JpcHRpb25JZCsrO1xuXHRcdHRoaXMuc3Vic2NyaXB0aW9uc1tleHRlcm5hbFN1YnNjcmlwdGlvbklkXSA9IFtdO1xuXHRcdGNvbnN0IHN1YnNjcmlwdGlvblByb21pc2VzID0gW107XG5cdFx0T2JqZWN0LmtleXModHJpZ2dlck1hcCkuZm9yRWFjaCggdHJpZ2dlck5hbWUgPT4ge1xuXHRcdFx0Ly8gRGVjb25zdHJ1Y3QgdGhlIHRyaWdnZXIgb3B0aW9ucyBhbmQgc2V0IGFueSBkZWZhdWx0c1xuXHRcdFx0Y29uc3Qge1xuXHRcdFx0XHRjaGFubmVsT3B0aW9ucyA9IHt9LFxuXHRcdFx0XHRmaWx0ZXIgPSAoKSA9PiB0cnVlLCAvLyBMZXQgYWxsIG1lc3NhZ2VzIHRocm91Z2ggYnkgZGVmYXVsdC5cblx0XHRcdH0gPSB0cmlnZ2VyTWFwW3RyaWdnZXJOYW1lXTtcblxuXHRcdFx0Ly8gMi4gZ2VuZXJhdGUgdGhlIGhhbmRsZXIgZnVuY3Rpb25cblx0XHRcdC8vXG5cdFx0XHQvLyByb290VmFsdWUgaXMgdGhlIHBheWxvYWQgc2VudCBieSB0aGUgZXZlbnQgZW1pdHRlciAvIHRyaWdnZXIgYnlcblx0XHRcdC8vIGNvbnZlbnRpb24gdGhpcyBpcyB0aGUgdmFsdWUgcmV0dXJuZWQgZnJvbSB0aGUgbXV0YXRpb25cblx0XHRcdC8vIHJlc29sdmVyXG5cdFx0XHRjb25zdCBvbk1lc3NhZ2UgPSAocm9vdFZhbHVlKSA9PiB7XG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMuY29udGV4dCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9wdGlvbnMuY29udGV4dCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gb3B0aW9ucy5jb250ZXh0O1xuXHRcdFx0XHR9KS50aGVuKChjb250ZXh0KSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIFByb21pc2UuYWxsKFtcblx0XHRcdFx0XHRcdGNvbnRleHQsXG5cdFx0XHRcdFx0XHRmaWx0ZXIocm9vdFZhbHVlLCBjb250ZXh0KSxcblx0XHRcdFx0XHRdKTtcblx0XHRcdFx0fSkudGhlbigoW2NvbnRleHQsIGRvRXhlY3V0ZV0pID0+IHtcblx0XHRcdFx0ICBpZiAoIWRvRXhlY3V0ZSkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0ICB9XG5cdFx0XHRcdCAgZXhlY3V0ZShcblx0XHRcdFx0XHQgIHRoaXMuc2NoZW1hLFxuXHRcdFx0XHRcdCAgcGFyc2VkUXVlcnksXG5cdFx0XHRcdFx0ICByb290VmFsdWUsXG5cdFx0XHRcdFx0ICBjb250ZXh0LFxuXHRcdFx0XHRcdCAgb3B0aW9ucy52YXJpYWJsZXMsXG5cdFx0XHRcdFx0ICBvcHRpb25zLm9wZXJhdGlvbk5hbWVcblx0XHRcdFx0ICApLnRoZW4oIGRhdGEgPT4ge1xuXHRcdFx0XHRcdCByZXR1cm4gb3B0aW9ucy5jYWxsYmFjayhkYXRhLmVycm9ycywgZGF0YSk7XG5cdFx0XHRcdCAgfSk7XG5cdFx0XHRcdH0pLmNhdGNoKChlcnJvcikgPT4ge1xuXHRcdFx0XHRcdG9wdGlvbnMuY2FsbGJhY2soZXJyb3IpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH07XG5cblx0XHRcdC8vIDMuIHN1YnNjcmliZSBhbmQga2VlcCB0aGUgc3Vic2NyaXB0aW9uIGlkXG5cdFx0XHRzdWJzY3JpcHRpb25Qcm9taXNlcy5wdXNoKFxuXHRcdFx0XHR0aGlzLnB1YnN1Yi5zdWJzY3JpYmUodHJpZ2dlck5hbWUsIG9uTWVzc2FnZSwgY2hhbm5lbE9wdGlvbnMpXG5cdFx0XHRcdFx0LnRoZW4oaWQgPT4gdGhpcy5zdWJzY3JpcHRpb25zW2V4dGVybmFsU3Vic2NyaXB0aW9uSWRdLnB1c2goaWQpKVxuXHRcdFx0KTtcblx0XHR9KTtcblxuXHRcdC8vIFJlc29sdmUgdGhlIHByb21pc2Ugd2l0aCBleHRlcm5hbCBzdWIgaWQgb25seSBhZnRlciBhbGwgc3Vic2NyaXB0aW9ucyBjb21wbGV0ZWRcblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoc3Vic2NyaXB0aW9uUHJvbWlzZXMpLnRoZW4oKCkgPT4gZXh0ZXJuYWxTdWJzY3JpcHRpb25JZCk7XG5cdH1cblxuXHR1bnN1YnNjcmliZShzdWJJZCl7XG5cdFx0Ly8gcGFzcyB0aGUgc3ViSWQgcmlnaHQgdGhyb3VnaCB0byBwdWJzdWIuIERvIG5vdGhpbmcgZWxzZS5cblx0XHR0aGlzLnN1YnNjcmlwdGlvbnNbc3ViSWRdLmZvckVhY2goIGludGVybmFsSWQgPT4ge1xuXHRcdFx0dGhpcy5wdWJzdWIudW5zdWJzY3JpYmUoaW50ZXJuYWxJZCk7XG5cdFx0fSk7XG5cdFx0ZGVsZXRlIHRoaXMuc3Vic2NyaXB0aW9uc1tzdWJJZF07XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFN1YnNjcmlwdGlvbk1hbmFnZXI7XG4iXX0=