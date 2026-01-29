import express from 'express'
import './model/mongodb/mongodbConnection.js'
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors'
import upload from 'express-fileupload'
import auth from './middleware/auth.js'
import fileUpload from './restApi/fileUpload.js'
import fileDownload from './restApi/fileProvider.js'
import designFileUpload from './restApi/designFileUpload.js'
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import schema from "./model/graphQL/schema.js"
import schemaWithPermissions from './middleware/permissions.js'
import { subscriptionAuth } from './util/functions.js';



const app = express()

// CORS configuration - allows frontend from environment variable or localhost
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200
}))

app.use(upload())
app.use('/fileUpload', auth, fileUpload);
app.use('/fileDownload', auth, fileDownload);
app.use('/designFileUpload', designFileUpload);
const httpServer = http.createServer(app);



const context = (ctx) => ctx;

const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
});
const serverCleanup = useServer({
    schema,
    context: async (ctx, msg, args) => {
        return subscriptionAuth(ctx.connectionParams.authorization)
        // Returning an object will add that information to
        // contextValue, which all of our resolvers have access to.
        // return getDynamicContext(ctx, msg, args);
    },

}, wsServer);

const server = new ApolloServer({
    schema: schemaWithPermissions,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer }),
    {
        async serverWillStart() {
            return {
                async drainServer() {
                    await serverCleanup.dispose();
                },
            };
        },
    }
    ],
});


await server.start();
app.use('/', bodyParser.json(), expressMiddleware(server, { context }));

app.use(
    bodyParser.json(),
    expressMiddleware(server, { context }),
);


const PORT = process.env.PORT || 4000;
await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
console.log(`🚀 Server ready at http://localhost:${PORT}`);