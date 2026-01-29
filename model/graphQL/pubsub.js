const { PubSub } = require("graphql-subscriptions");

// Shared PubSub instance for all GraphQL subscriptions
const pubsub = new PubSub();

module.exports = pubsub;

