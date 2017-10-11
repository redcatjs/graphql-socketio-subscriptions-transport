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
				return _promise2.default.reject < number > new ValidationError(errors);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tYW5hZ2VyLmpzIl0sIm5hbWVzIjpbIlN1YnNjcmlwdGlvbk1hbmFnZXIiLCJvcHRpb25zIiwicHVic3ViIiwic2NoZW1hIiwic2V0dXBGdW5jdGlvbnMiLCJzdWJzY3JpcHRpb25zIiwibWF4U3Vic2NyaXB0aW9uSWQiLCJ0cmlnZ2VyTmFtZSIsInBheWxvYWQiLCJwdWJsaXNoIiwicGFyc2VkUXVlcnkiLCJxdWVyeSIsImVycm9ycyIsImxlbmd0aCIsInJlamVjdCIsIm51bWJlciIsIlZhbGlkYXRpb25FcnJvciIsImFyZ3MiLCJzdWJzY3JpcHRpb25OYW1lIiwiZGVmaW5pdGlvbnMiLCJmb3JFYWNoIiwiZGVmaW5pdGlvbiIsImtpbmQiLCJyb290RmllbGQiLCJzZWxlY3Rpb25TZXQiLCJzZWxlY3Rpb25zIiwibmFtZSIsInZhbHVlIiwiZmllbGRzIiwiZ2V0U3Vic2NyaXB0aW9uVHlwZSIsImdldEZpZWxkcyIsInZhcmlhYmxlcyIsInRyaWdnZXJNYXAiLCJleHRlcm5hbFN1YnNjcmlwdGlvbklkIiwic3Vic2NyaXB0aW9uUHJvbWlzZXMiLCJjaGFubmVsT3B0aW9ucyIsImZpbHRlciIsIm9uTWVzc2FnZSIsInJvb3RWYWx1ZSIsInJlc29sdmUiLCJ0aGVuIiwiY29udGV4dCIsImFsbCIsImRvRXhlY3V0ZSIsIm9wZXJhdGlvbk5hbWUiLCJjYWxsYmFjayIsImRhdGEiLCJjYXRjaCIsImVycm9yIiwicHVzaCIsInN1YnNjcmliZSIsImlkIiwic3ViSWQiLCJ1bnN1YnNjcmliZSIsImludGVybmFsSWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFVQTs7QUFFQTs7OztJQUtNQSxtQjtBQUVMLDhCQUFZQyxPQUFaLEVBQW9CO0FBQUE7O0FBQ25CLE9BQUtDLE1BQUwsR0FBY0QsUUFBUUMsTUFBdEI7QUFDQSxPQUFLQyxNQUFMLEdBQWNGLFFBQVFFLE1BQXRCO0FBQ0EsT0FB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LDRCQUNDLE1BQUt4QyxNQUROLEVBRUNPLFdBRkQsRUFHQzRCLFNBSEQsRUFJQ0csT0FKRCxFQUtDeEMsUUFBUThCLFNBTFQsRUFNQzlCLFFBQVEyQyxhQU5ULEVBT0VKLElBUEYsQ0FPUSxnQkFBUTtBQUNoQixjQUFPdkMsUUFBUTRDLFFBQVIsQ0FBaUJDLEtBQUtsQyxNQUF0QixFQUE4QmtDLElBQTlCLENBQVA7QUFDQyxPQVREO0FBVUQsTUF4Qk0sRUF3QkpDLEtBeEJJLENBd0JFLFVBQUNDLEtBQUQsRUFBVztBQUNuQi9DLGNBQVE0QyxRQUFSLENBQWlCRyxLQUFqQjtBQUNBLE1BMUJNLENBQVA7QUEyQkEsS0E1QkQ7O0FBOEJBO0FBQ0FkLHlCQUFxQmUsSUFBckIsQ0FDQyxNQUFLL0MsTUFBTCxDQUFZZ0QsU0FBWixDQUFzQjNDLFdBQXRCLEVBQW1DOEIsU0FBbkMsRUFBOENGLGNBQTlDLEVBQ0VLLElBREYsQ0FDTztBQUFBLFlBQU0sTUFBS25DLGFBQUwsQ0FBbUI0QixzQkFBbkIsRUFBMkNnQixJQUEzQyxDQUFnREUsRUFBaEQsQ0FBTjtBQUFBLEtBRFAsQ0FERDtBQUlBLElBL0NEOztBQWlEQTtBQUNBLFVBQU8sa0JBQVFULEdBQVIsQ0FBWVIsb0JBQVosRUFBa0NNLElBQWxDLENBQXVDO0FBQUEsV0FBTVAsc0JBQU47QUFBQSxJQUF2QyxDQUFQO0FBQ0E7Ozs4QkFFV21CLEssRUFBTTtBQUFBOztBQUNqQjtBQUNBLFFBQUsvQyxhQUFMLENBQW1CK0MsS0FBbkIsRUFBMEJoQyxPQUExQixDQUFtQyxzQkFBYztBQUNoRCxXQUFLbEIsTUFBTCxDQUFZbUQsV0FBWixDQUF3QkMsVUFBeEI7QUFDQSxJQUZEO0FBR0EsVUFBTyxLQUFLakQsYUFBTCxDQUFtQitDLEtBQW5CLENBQVA7QUFDQTs7Ozs7QUFDRDs7a0JBRWNwRCxtQiIsImZpbGUiOiJtYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJ1xuaW1wb3J0IHtcblx0R3JhcGhRTFNjaGVtYSxcblx0R3JhcGhRTEVycm9yLFxuXHR2YWxpZGF0ZSxcblx0ZXhlY3V0ZSxcblx0cGFyc2UsXG5cdHNwZWNpZmllZFJ1bGVzLFxuXHRPcGVyYXRpb25EZWZpbml0aW9uLFxuXHRGaWVsZCxcbn0gZnJvbSAnZ3JhcGhxbCdcbmltcG9ydCB7IGdldEFyZ3VtZW50VmFsdWVzIH0gZnJvbSAnZ3JhcGhxbC9leGVjdXRpb24vdmFsdWVzJ1xuXG5pbXBvcnQge1xuXHRzdWJzY3JpcHRpb25IYXNTaW5nbGVSb290RmllbGQsXG59IGZyb20gJy4vdmFsaWRhdGlvbidcblxuXG5jbGFzcyBTdWJzY3JpcHRpb25NYW5hZ2VyIHtcblx0XG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMpe1xuXHRcdHRoaXMucHVic3ViID0gb3B0aW9ucy5wdWJzdWI7XG5cdFx0dGhpcy5zY2hlbWEgPSBvcHRpb25zLnNjaGVtYTtcblx0XHR0aGlzLnNldHVwRnVuY3Rpb25zID0gb3B0aW9ucy5zZXR1cEZ1bmN0aW9ucyB8fCB7fTtcblx0XHR0aGlzLnN1YnNjcmlwdGlvbnMgPSB7fTtcblx0XHR0aGlzLm1heFN1YnNjcmlwdGlvbklkID0gMDtcblx0fVxuXG5cdHB1Ymxpc2godHJpZ2dlck5hbWUsIHBheWxvYWQpe1xuXHRcdHRoaXMucHVic3ViLnB1Ymxpc2godHJpZ2dlck5hbWUsIHBheWxvYWQpO1xuXHR9XG5cblx0c3Vic2NyaWJlKG9wdGlvbnMpe1xuXG5cdFx0Ly8gMS4gdmFsaWRhdGUgdGhlIHF1ZXJ5LCBvcGVyYXRpb25OYW1lIGFuZCB2YXJpYWJsZXNcblx0XHRjb25zdCBwYXJzZWRRdWVyeSA9IHBhcnNlKG9wdGlvbnMucXVlcnkpO1xuXHRcdGNvbnN0IGVycm9ycyA9IHZhbGlkYXRlKFxuXHRcdFx0dGhpcy5zY2hlbWEsXG5cdFx0XHRwYXJzZWRRdWVyeSxcblx0XHRcdFsuLi5zcGVjaWZpZWRSdWxlcywgc3Vic2NyaXB0aW9uSGFzU2luZ2xlUm9vdEZpZWxkXVxuXHRcdCk7XG5cblx0XHQvLyBUT0RPOiB2YWxpZGF0ZSB0aGF0IGFsbCB2YXJpYWJsZXMgaGF2ZSBiZWVuIHBhc3NlZCAoYW5kIGFyZSBvZiBjb3JyZWN0IHR5cGUpP1xuXHRcdGlmIChlcnJvcnMubGVuZ3RoKXtcblx0XHRcdC8vIHRoaXMgZXJyb3Iga2lsbHMgdGhlIHN1YnNjcmlwdGlvbiwgc28gd2UgdGhyb3cgaXQuXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3Q8bnVtYmVyPihuZXcgVmFsaWRhdGlvbkVycm9yKGVycm9ycykpO1xuXHRcdH1cblxuXHRcdGxldCBhcmdzID0ge307XG5cblx0XHQvLyBvcGVyYXRpb25OYW1lIGlzIHRoZSBuYW1lIG9mIHRoZSBvbmx5IHJvb3QgZmllbGQgaW4gdGhlIHN1YnNjcmlwdGlvbiBkb2N1bWVudFxuXHRcdGxldCBzdWJzY3JpcHRpb25OYW1lID0gJyc7XG5cdFx0cGFyc2VkUXVlcnkuZGVmaW5pdGlvbnMuZm9yRWFjaCggZGVmaW5pdGlvbiA9PiB7XG5cdFx0XHRpZiAoZGVmaW5pdGlvbi5raW5kID09PSAnT3BlcmF0aW9uRGVmaW5pdGlvbicpe1xuXHRcdFx0XHQvLyBvbmx5IG9uZSByb290IGZpZWxkIGlzIGFsbG93ZWQgb24gc3Vic2NyaXB0aW9uLiBObyBmcmFnbWVudHMgZm9yIG5vdy5cblx0XHRcdFx0Y29uc3Qgcm9vdEZpZWxkID0gKGRlZmluaXRpb24pLnNlbGVjdGlvblNldC5zZWxlY3Rpb25zWzBdO1xuXHRcdFx0XHRzdWJzY3JpcHRpb25OYW1lID0gcm9vdEZpZWxkLm5hbWUudmFsdWU7XG5cblx0XHRcdFx0Y29uc3QgZmllbGRzID0gdGhpcy5zY2hlbWEuZ2V0U3Vic2NyaXB0aW9uVHlwZSgpLmdldEZpZWxkcygpO1xuXHRcdFx0XHRhcmdzID0gZ2V0QXJndW1lbnRWYWx1ZXMoZmllbGRzW3N1YnNjcmlwdGlvbk5hbWVdLCByb290RmllbGQsIG9wdGlvbnMudmFyaWFibGVzKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGxldCB0cmlnZ2VyTWFwO1xuXG5cdFx0aWYgKHRoaXMuc2V0dXBGdW5jdGlvbnNbc3Vic2NyaXB0aW9uTmFtZV0pIHtcblx0XHRcdHRyaWdnZXJNYXAgPSB0aGlzLnNldHVwRnVuY3Rpb25zW3N1YnNjcmlwdGlvbk5hbWVdKG9wdGlvbnMsIGFyZ3MsIHN1YnNjcmlwdGlvbk5hbWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpZiBub3QgcHJvdmlkZWQsIHRoZSB0cmlnZ2VyTmFtZSB3aWxsIGJlIHRoZSBzdWJzY3JpcHRpb25OYW1lLCBUaGUgdHJpZ2dlciB3aWxsIG5vdCBoYXZlIGFueVxuXHRcdFx0Ly8gb3B0aW9ucyBhbmQgcmVseSBvbiBkZWZhdWx0cyB0aGF0IGFyZSBzZXQgbGF0ZXIuXG5cdFx0XHR0cmlnZ2VyTWFwID0ge1tzdWJzY3JpcHRpb25OYW1lXToge319O1xuXHRcdH1cblxuXHRcdGNvbnN0IGV4dGVybmFsU3Vic2NyaXB0aW9uSWQgPSB0aGlzLm1heFN1YnNjcmlwdGlvbklkKys7XG5cdFx0dGhpcy5zdWJzY3JpcHRpb25zW2V4dGVybmFsU3Vic2NyaXB0aW9uSWRdID0gW107XG5cdFx0Y29uc3Qgc3Vic2NyaXB0aW9uUHJvbWlzZXMgPSBbXTtcblx0XHRPYmplY3Qua2V5cyh0cmlnZ2VyTWFwKS5mb3JFYWNoKCB0cmlnZ2VyTmFtZSA9PiB7XG5cdFx0XHQvLyBEZWNvbnN0cnVjdCB0aGUgdHJpZ2dlciBvcHRpb25zIGFuZCBzZXQgYW55IGRlZmF1bHRzXG5cdFx0XHRjb25zdCB7XG5cdFx0XHRcdGNoYW5uZWxPcHRpb25zID0ge30sXG5cdFx0XHRcdGZpbHRlciA9ICgpID0+IHRydWUsIC8vIExldCBhbGwgbWVzc2FnZXMgdGhyb3VnaCBieSBkZWZhdWx0LlxuXHRcdFx0fSA9IHRyaWdnZXJNYXBbdHJpZ2dlck5hbWVdO1xuXG5cdFx0XHQvLyAyLiBnZW5lcmF0ZSB0aGUgaGFuZGxlciBmdW5jdGlvblxuXHRcdFx0Ly9cblx0XHRcdC8vIHJvb3RWYWx1ZSBpcyB0aGUgcGF5bG9hZCBzZW50IGJ5IHRoZSBldmVudCBlbWl0dGVyIC8gdHJpZ2dlciBieVxuXHRcdFx0Ly8gY29udmVudGlvbiB0aGlzIGlzIHRoZSB2YWx1ZSByZXR1cm5lZCBmcm9tIHRoZSBtdXRhdGlvblxuXHRcdFx0Ly8gcmVzb2x2ZXJcblx0XHRcdGNvbnN0IG9uTWVzc2FnZSA9IChyb290VmFsdWUpID0+IHtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5jb250ZXh0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb3B0aW9ucy5jb250ZXh0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBvcHRpb25zLmNvbnRleHQ7XG5cdFx0XHRcdH0pLnRoZW4oKGNvbnRleHQpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoW1xuXHRcdFx0XHRcdFx0Y29udGV4dCxcblx0XHRcdFx0XHRcdGZpbHRlcihyb290VmFsdWUsIGNvbnRleHQpLFxuXHRcdFx0XHRcdF0pO1xuXHRcdFx0XHR9KS50aGVuKChbY29udGV4dCwgZG9FeGVjdXRlXSkgPT4ge1xuXHRcdFx0XHQgIGlmICghZG9FeGVjdXRlKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHQgIH1cblx0XHRcdFx0ICBleGVjdXRlKFxuXHRcdFx0XHRcdCAgdGhpcy5zY2hlbWEsXG5cdFx0XHRcdFx0ICBwYXJzZWRRdWVyeSxcblx0XHRcdFx0XHQgIHJvb3RWYWx1ZSxcblx0XHRcdFx0XHQgIGNvbnRleHQsXG5cdFx0XHRcdFx0ICBvcHRpb25zLnZhcmlhYmxlcyxcblx0XHRcdFx0XHQgIG9wdGlvbnMub3BlcmF0aW9uTmFtZVxuXHRcdFx0XHQgICkudGhlbiggZGF0YSA9PiB7XG5cdFx0XHRcdFx0IHJldHVybiBvcHRpb25zLmNhbGxiYWNrKGRhdGEuZXJyb3JzLCBkYXRhKTtcblx0XHRcdFx0ICB9KTtcblx0XHRcdFx0fSkuY2F0Y2goKGVycm9yKSA9PiB7XG5cdFx0XHRcdFx0b3B0aW9ucy5jYWxsYmFjayhlcnJvcik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fTtcblxuXHRcdFx0Ly8gMy4gc3Vic2NyaWJlIGFuZCBrZWVwIHRoZSBzdWJzY3JpcHRpb24gaWRcblx0XHRcdHN1YnNjcmlwdGlvblByb21pc2VzLnB1c2goXG5cdFx0XHRcdHRoaXMucHVic3ViLnN1YnNjcmliZSh0cmlnZ2VyTmFtZSwgb25NZXNzYWdlLCBjaGFubmVsT3B0aW9ucylcblx0XHRcdFx0XHQudGhlbihpZCA9PiB0aGlzLnN1YnNjcmlwdGlvbnNbZXh0ZXJuYWxTdWJzY3JpcHRpb25JZF0ucHVzaChpZCkpXG5cdFx0XHQpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gUmVzb2x2ZSB0aGUgcHJvbWlzZSB3aXRoIGV4dGVybmFsIHN1YiBpZCBvbmx5IGFmdGVyIGFsbCBzdWJzY3JpcHRpb25zIGNvbXBsZXRlZFxuXHRcdHJldHVybiBQcm9taXNlLmFsbChzdWJzY3JpcHRpb25Qcm9taXNlcykudGhlbigoKSA9PiBleHRlcm5hbFN1YnNjcmlwdGlvbklkKTtcblx0fVxuXG5cdHVuc3Vic2NyaWJlKHN1YklkKXtcblx0XHQvLyBwYXNzIHRoZSBzdWJJZCByaWdodCB0aHJvdWdoIHRvIHB1YnN1Yi4gRG8gbm90aGluZyBlbHNlLlxuXHRcdHRoaXMuc3Vic2NyaXB0aW9uc1tzdWJJZF0uZm9yRWFjaCggaW50ZXJuYWxJZCA9PiB7XG5cdFx0XHR0aGlzLnB1YnN1Yi51bnN1YnNjcmliZShpbnRlcm5hbElkKTtcblx0XHR9KTtcblx0XHRkZWxldGUgdGhpcy5zdWJzY3JpcHRpb25zW3N1YklkXTtcblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgU3Vic2NyaXB0aW9uTWFuYWdlcjtcbiJdfQ==