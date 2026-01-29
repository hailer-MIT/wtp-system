import express from "express";
import "./model/mongodb/mongodbConnection.js";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";
import upload from "express-fileupload";
import auth from "./middleware/auth.js";
import fileUpload from "./restApi/fileUpload.js";
import fileDownload from "./restApi/fileProvider.js";
import designFileUpload from "./restApi/designFileUpload.js";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import schema from "./model/graphQL/schema.js";
import schemaWithPermissions from "./middleware/permissions.js";
import { subscriptionAuth } from "./util/functions.js";

const app = express();
app.use(
  cors([
    {
      origin: "http://192.168.110.124:3000",
      optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    },
    {
      origin: "http://localhost:3000",
      optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    },
  ])
);

app.use(upload());
app.use("/fileUpload", auth, fileUpload);
app.use("/fileDownload", auth, fileDownload);
app.use("/designFileUpload", designFileUpload);
const httpServer = http.createServer(app);

const context = (ctx) => ctx;

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/",
});
const serverCleanup = useServer(
  {
    schema,
    context: async (ctx, msg, args) => {
      return subscriptionAuth(ctx.connectionParams.authorization);
      // Returning an object will add that information to
      // contextValue, which all of our resolvers have access to.
      // return getDynamicContext(ctx, msg, args);
    },
  },
  wsServer
);

const server = new ApolloServer({
  schema: schemaWithPermissions,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();
app.use("/", bodyParser.json(), expressMiddleware(server, { context }));

app.use(bodyParser.json(), expressMiddleware(server, { context }));

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000`);
