import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import {
  ApolloClient,
  HttpLink,
  ApolloLink,
  InMemoryCache,
  ApolloProvider,
  split,
} from "@apollo/client";
import { model } from "./context";
import Context from "./context";
import { onError } from "@apollo/client/link/error";
import { createStore, StoreProvider } from "easy-peasy";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const store = createStore(model);

const httpLink = new HttpLink({
  uri: store?.getState()?.apiUrl?.url,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000/",
    // url: "wss://api.mekdesprinting.com/",

    connectionParams: () => ({
      authorization: localStorage.getItem("token"),
    }),

    reconnect: true,
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const authMiddleware = new ApolloLink((operation, forward) => {
  // console.log(localStorage.getItem('token'))
  // add the authorization to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: localStorage.getItem("token"),
    },
  }));

  return forward(operation);
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      store.dispatch.snackbar.setSnackbar({
        openSnackbar: true,
        severity: "error",
        message: `${message}`,
      });
      if (message.includes("Not Authorised!")) {
        console.log(message);
        localStorage.setItem("token", "");
        store.dispatch.router.setLocation("/");
      }
    });
  if (networkError == "TypeError: Failed to fetch") {
    store.dispatch.snackbar.setSnackbar({
      openSnackbar: true,
      severity: "error",
      message: "Network error",
    });
    // console.log(`[Network error]: ${networkError}`);
  }
  // return forward(operation);
});

const client = new ApolloClient({
  // link: concat(errorLink,authMiddleware , httpLink),
  link: errorLink.concat(authMiddleware.concat(splitLink)),
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ApolloProvider client={client}>
        <Context>
          <StoreProvider store={store}>
            {" "}
            <App />{" "}
          </StoreProvider>
        </Context>
      </ApolloProvider>
    </BrowserRouter>
  </React.StrictMode>
);
