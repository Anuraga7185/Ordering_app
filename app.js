import Fastify from "fastify";
import { connectDB } from "./src/config/connect.js";
import "dotenv/config"
import { PORT } from "./src/config/config.js";
import { admin, buildAdminRouter } from "./src/config/setup.js";
import { registerRoutes } from "./src/routes/index.js";
import fastifySocketIO from "fastify-socket.io";
const start = async () => {
    await connectDB(process.env.MONGO_URI);
    const app = Fastify();

    app.register(fastifySocketIO, {
        cors: {
            origin: "*",
        },
        pingInterval: 10000,
        pingTimeout: 5000,
        transports: ["websocket"],
    });
    
    await registerRoutes(app);
    await buildAdminRouter(app);

    app.listen({ port: PORT, host: "0.0.0.0" },
        (err, addr) => {
            if (err) {
                console.log(err);
            } else {
                console.log(`Blinkit Started on http://localhost:${PORT}${admin.options.rootPath}`);
            }
        });
    app.ready().then(
        () => {
            console.log("✅ WebSocket Server Ready!");

            if (!app.io) {
                console.error("❌ WebSocket Plugin Not Loaded!");
                return;
            }

            app.io.on("connection", (socket) => {
                console.log("A User Connected")
                socket.on("joinRoom", (orderId) => {
                    socket.join(orderId);
                    console.log(`User Joined room ${orderId}`); // ✅ Correct way
                    console.log(orderId);
                });
                // Listen for messages from the client
                socket.on("message", (data) => {
                    console.log("Received message:", data);

                    const { orderId, message } = data
                    console.log(message);
                    console.log(socket.id);
                    console.log(`Received message: ${orderId}`);

                    // Send message to ALL clients in the room (including sender)
                    app.io.to(orderId).emit("message", {
                        sender: socket.id,
                        message: message
                    });
                });
        
                socket.on('disconnect', () => {
                    console.log("User DIsconnected")
                })
            })
        }
    );
};


start();