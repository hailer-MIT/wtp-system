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
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'];

console.log('🔧 CORS allowed origins:', allowedOrigins);

// CORS middleware - MUST be before other middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin is allowed
        const isAllowed = allowedOrigins.indexOf(origin) !== -1 ||
            allowedOrigins.includes('*') ||
            origin.endsWith('.onrender.com'); // Allow all Render subdomains

        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('❌ CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'authorization', 'content-type'],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 200,
    preflightContinue: false
}));

// Handle preflight requests explicitly
app.options('*', cors());

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
const HOST = '0.0.0.0'; // Bind to all network interfaces (required for Render)

await new Promise((resolve) => httpServer.listen({ port: PORT, host: HOST }, resolve));
console.log(`🚀 Server ready at http://${HOST}:${PORT}`);