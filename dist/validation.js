'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tooManySubscriptionFieldsError = tooManySubscriptionFieldsError;
exports.subscriptionHasSingleRootField = subscriptionHasSingleRootField;

var _graphql = require('graphql');

// XXX I don't know how else to do this. Can't seem to import from GraphQL.
var FIELD = 'Field';

function tooManySubscriptionFieldsError(subscriptionName) {
  return 'Subscription "' + subscriptionName + '" must have only one field.';
}

// XXX we temporarily use this validation rule to make our life a bit easier.

function subscriptionHasSingleRootField(context) {
  var schema = context.getSchema();
  schema.getSubscriptionType();
  return {
    OperationDefinition: function OperationDefinition(node) {
      var operationName = node.name ? node.name.value : '';
      var numFields = 0;
      node.selectionSet.selections.forEach(function (selection) {
        if (selection.kind === FIELD) {
          numFields++;
        } else {
          // why the heck use a fragment on the Subscription type? Just ... don't
          context.reportError(new _graphql.GraphQLError('Apollo subscriptions do not support fragments on the root field', [node]));
        }
      });
      if (numFields > 1) {
        context.reportError(new _graphql.GraphQLError(tooManySubscriptionFieldsError(operationName), [node]));
      }
      return false;
    }
  };
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92YWxpZGF0aW9uLmpzIl0sIm5hbWVzIjpbInRvb01hbnlTdWJzY3JpcHRpb25GaWVsZHNFcnJvciIsInN1YnNjcmlwdGlvbkhhc1NpbmdsZVJvb3RGaWVsZCIsIkZJRUxEIiwic3Vic2NyaXB0aW9uTmFtZSIsImNvbnRleHQiLCJzY2hlbWEiLCJnZXRTY2hlbWEiLCJnZXRTdWJzY3JpcHRpb25UeXBlIiwiT3BlcmF0aW9uRGVmaW5pdGlvbiIsIm5vZGUiLCJvcGVyYXRpb25OYW1lIiwibmFtZSIsInZhbHVlIiwibnVtRmllbGRzIiwic2VsZWN0aW9uU2V0Iiwic2VsZWN0aW9ucyIsImZvckVhY2giLCJzZWxlY3Rpb24iLCJraW5kIiwicmVwb3J0RXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7O1FBVWdCQSw4QixHQUFBQSw4QjtRQU1BQyw4QixHQUFBQSw4Qjs7QUFoQmhCOztBQU1BO0FBQ0EsSUFBTUMsUUFBUSxPQUFkOztBQUdPLFNBQVNGLDhCQUFULENBQXdDRyxnQkFBeEMsRUFBeUQ7QUFDOUQsNEJBQXdCQSxnQkFBeEI7QUFDRDs7QUFFRDs7QUFFTyxTQUFTRiw4QkFBVCxDQUF3Q0csT0FBeEMsRUFBaUQ7QUFDdEQsTUFBTUMsU0FBU0QsUUFBUUUsU0FBUixFQUFmO0FBQ0FELFNBQU9FLG1CQUFQO0FBQ0EsU0FBTztBQUNMQyx1QkFESywrQkFDZUMsSUFEZixFQUNxQjtBQUN4QixVQUFNQyxnQkFBZ0JELEtBQUtFLElBQUwsR0FBWUYsS0FBS0UsSUFBTCxDQUFVQyxLQUF0QixHQUE4QixFQUFwRDtBQUNBLFVBQUlDLFlBQVksQ0FBaEI7QUFDQUosV0FBS0ssWUFBTCxDQUFrQkMsVUFBbEIsQ0FBNkJDLE9BQTdCLENBQXNDLFVBQUNDLFNBQUQsRUFBZTtBQUNuRCxZQUFJQSxVQUFVQyxJQUFWLEtBQW1CaEIsS0FBdkIsRUFBOEI7QUFDNUJXO0FBQ0QsU0FGRCxNQUVPO0FBQ0w7QUFDQVQsa0JBQVFlLFdBQVIsQ0FBb0IsMEJBQWlCLGlFQUFqQixFQUFvRixDQUFDVixJQUFELENBQXBGLENBQXBCO0FBQ0Q7QUFDRixPQVBEO0FBUUEsVUFBSUksWUFBWSxDQUFoQixFQUFtQjtBQUNqQlQsZ0JBQVFlLFdBQVIsQ0FBb0IsMEJBQWlCbkIsK0JBQStCVSxhQUEvQixDQUFqQixFQUFnRSxDQUFDRCxJQUFELENBQWhFLENBQXBCO0FBQ0Q7QUFDRCxhQUFPLEtBQVA7QUFDRDtBQWhCSSxHQUFQO0FBa0JEIiwiZmlsZSI6InZhbGlkYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBWYWxpZGF0aW9uQ29udGV4dCxcbiAgU2VsZWN0aW9uLFxuICBHcmFwaFFMRXJyb3IsXG59IGZyb20gJ2dyYXBocWwnO1xuXG4vLyBYWFggSSBkb24ndCBrbm93IGhvdyBlbHNlIHRvIGRvIHRoaXMuIENhbid0IHNlZW0gdG8gaW1wb3J0IGZyb20gR3JhcGhRTC5cbmNvbnN0IEZJRUxEID0gJ0ZpZWxkJztcblxuXG5leHBvcnQgZnVuY3Rpb24gdG9vTWFueVN1YnNjcmlwdGlvbkZpZWxkc0Vycm9yKHN1YnNjcmlwdGlvbk5hbWUpe1xuICByZXR1cm4gYFN1YnNjcmlwdGlvbiBcIiR7c3Vic2NyaXB0aW9uTmFtZX1cIiBtdXN0IGhhdmUgb25seSBvbmUgZmllbGQuYDtcbn1cblxuLy8gWFhYIHdlIHRlbXBvcmFyaWx5IHVzZSB0aGlzIHZhbGlkYXRpb24gcnVsZSB0byBtYWtlIG91ciBsaWZlIGEgYml0IGVhc2llci5cblxuZXhwb3J0IGZ1bmN0aW9uIHN1YnNjcmlwdGlvbkhhc1NpbmdsZVJvb3RGaWVsZChjb250ZXh0KSB7XG4gIGNvbnN0IHNjaGVtYSA9IGNvbnRleHQuZ2V0U2NoZW1hKCk7XG4gIHNjaGVtYS5nZXRTdWJzY3JpcHRpb25UeXBlKCk7XG4gIHJldHVybiB7XG4gICAgT3BlcmF0aW9uRGVmaW5pdGlvbihub2RlKSB7XG4gICAgICBjb25zdCBvcGVyYXRpb25OYW1lID0gbm9kZS5uYW1lID8gbm9kZS5uYW1lLnZhbHVlIDogJyc7XG4gICAgICBsZXQgbnVtRmllbGRzID0gMDtcbiAgICAgIG5vZGUuc2VsZWN0aW9uU2V0LnNlbGVjdGlvbnMuZm9yRWFjaCggKHNlbGVjdGlvbikgPT4ge1xuICAgICAgICBpZiAoc2VsZWN0aW9uLmtpbmQgPT09IEZJRUxEKSB7XG4gICAgICAgICAgbnVtRmllbGRzKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gd2h5IHRoZSBoZWNrIHVzZSBhIGZyYWdtZW50IG9uIHRoZSBTdWJzY3JpcHRpb24gdHlwZT8gSnVzdCAuLi4gZG9uJ3RcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydEVycm9yKG5ldyBHcmFwaFFMRXJyb3IoJ0Fwb2xsbyBzdWJzY3JpcHRpb25zIGRvIG5vdCBzdXBwb3J0IGZyYWdtZW50cyBvbiB0aGUgcm9vdCBmaWVsZCcsIFtub2RlXSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChudW1GaWVsZHMgPiAxKSB7XG4gICAgICAgIGNvbnRleHQucmVwb3J0RXJyb3IobmV3IEdyYXBoUUxFcnJvcih0b29NYW55U3Vic2NyaXB0aW9uRmllbGRzRXJyb3Iob3BlcmF0aW9uTmFtZSksIFtub2RlXSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gIH07XG59O1xuIl19