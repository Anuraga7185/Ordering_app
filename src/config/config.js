import 'dotenv/config';
import fastifySession from "@fastify/session";
import ConnectMongodbSession from 'connect-mongodb-session';
import { Admin } from "../models/index.js";
const MongoDBStore = ConnectMongodbSession(fastifySession);

export const sessionStore = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "session",
});
sessionStore.on("error", (error) => {
    console.log("Session store error", error);
});
export const authenticate = async (email, password) => {
    if (email == 'ritik@gmail.com' && password == '12345678') {
        return Promise.resolve({ email: email, password: password });
    } else {
        return null;
    }
};

export const PORT = process.env.PORT || 3000;
export const COOKIE_PASSWORD = process.env.COOKIE_PASSWORD;