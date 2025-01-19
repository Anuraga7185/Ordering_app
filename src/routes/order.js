import { confirmOrder, createOrder, getOrderByID, getOrders, udateOrderStatus } from "../controllers/order/order.js";
import { verifyToken } from "../middleware/auth.js";
import fastify from "fastify";

export const orderRoutes = async (fastify, options) => {

    fastify.addHook('preHandler', async (request, reply) => {
        const isAuthenticated = await verifyToken(request, reply);
        if (!isAuthenticated) {
            return reply.status(401).send({ message: "Unauthenticated" });
        }
    });                 
    fastify.post("/order", createOrder);
    fastify.get("/order", getOrders);
    fastify.patch("/order/:orderId/status", udateOrderStatus);
    fastify.post("/order/:orderId/confirm", confirmOrder);
    fastify.post("/order/:orderId", getOrderByID);

};