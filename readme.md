# graphql-socketio-subscriptions-transport

Remake of [subscriptions-transport-socketio](https://github.com/Maxpain177/subscriptions-transport-socketio)
which is a remake of [subscriptions-transport-ws](https://github.com/apollostack/subscriptions-transport-ws)

## Client
### `Constructor(ref)`
- `ref` : [SocketIO](https://github.com/socketio/socket.io-client) instance

### Methods
#### `subscribe(options, handler) => id`
- `options`
  * `query` : GraphQL subscription
  * `variables` : GraphQL subscription variables
  * `operationName` : operation name of the subscription
- `handler: (errors, result) => void` : function to handle any errors and results from the subscription response

#### `unsubscribe(id) => void`
- `id` : the subscription ID of the subscription to unsubscribe fro


## Server
### `Constructor(options, ref)`
- `options`
  * `schema` : [Executable Schema](https://github.com/apollographql/graphql-tools)
  * `pubsub` : [GraphQL subscription manager](https://github.com/apollostack/graphql-subscriptions)
- `ref` : [SocketIO](https://github.com/socketio/socket.io) instance




## Client-server messages
Each message has a type, as well as associated fields depending on the message type.
### Client -> Server
#### SUBSCRIPTION_START
Client sends this message to start a subscription for a query.
- `query` :  GraphQL subscription
- `variables` : GraphQL subscription variables
- `operationName` : operation name of the subscription
- `id` : subscription ID

#### SUBSCRIPTION_END
Client sends this message to end a subscription.
- `id` : subscription ID of the subscription to be terminated

### Server -> Client
#### SUBSCRIPTION_SUCCESS
The server sends this message to confirm that it has validated the subscription query and
is subscribed to the triggers.
- `id` : ID of the subscription that was successfully set up

#### SUBSCRIPTION_FAIL
Server sends this message upon failing to register a subscription. It may also send this message
at any point during the subscription to notify the client the the subscription has been stopped.
- `errors` : array of errors attributed to the subscription failing on the server
- `id` : subscription ID of the subscription that failed on the server

#### SUBSCRIPTION_DATA
GraphQL result sent periodically from server to client according to subscription.
- `payload` : GraphQL result from running the subscription
- `id` : subscription ID
