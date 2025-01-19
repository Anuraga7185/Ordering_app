import Order from "../../models/Order.js";
import Branch from "../../models/branch.js";
import { Customer, DeliveryPartner } from "../../models/user.js"



export const createOrder = async (req, reply) => {
    try {
        const { userId } = req.user;
        const { items, branch, totalPrice } = req.body;

        const customerData = await Customer.findById(userId);
        const branchData = await Branch.findById(branch);
        if (!customerData) {
            return reply.status(404).send({ message: "Customer not found" });
        }
        const newOrder = new Order({
            customer: userId,
            items: items.map((item) => ({
                id: item.id,
                item: item.item,
                count: item.count
            })),
            branch,
            totalPrice,
            deliveryLocation: {
                latitude: customerData.liveLocation.latitude,
                longitude: customerData.liveLocation.longitude,
                address: customerData.address || "No address available"
            },
            pickupLocation: {
                latitude: branchData.location.latitude,
                longitude: branchData.location.longitude,
                address: branchData.address || "No address available"
            },

        });

        const savedOrder = await newOrder.save();
        return reply.status(201).send(savedOrder);


    } catch (error) {
        reply.status(500).send({ message: "An error Occurred", error });
    }
};
export const confirmOrder = async (req, reply) => {
    try {
        const { orderId } = req.params;
        const { userId } = req.user;
        const { deliveryPeronLocation } = req.body;
        const deliveryPerson = await DeliveryPartner.findById(userId);
        if (!deliveryPerson) {
            return reply.status(404).send({ message: "delivery Person not found" });
        }
        const order = await Order.findById(orderId);

        if (!order) {
            return reply.status(404).send({ message: "Order not found" });
        }
        if (order.status !== 'available') {
            return reply.statuS(404).send({ message: "Order is not available" });
        }
        order.status = 'confirmed'
        order.deliveryPartner = userId;
        order.deliveryPeronLocation = {
            latitude: deliveryPeronLocation?.latitude,
            longitude: deliveryPeronLocation?.longitude,
            address: deliveryPeronLocation.address || ""
        };

        req.server.io.to(orderId).emit("orderConfirmed", order);
        await order.save();
        return reply.send(order);

    } catch (error) {
        return reply.status(500).send({ message: "An error Occurred", error });
    }
};

export const udateOrderStatus = async (req, reply) => {
    try {
        const { orderId } = req.params;
        const { status, deliveryPeronLocation } = req.body;
        const { userId } = req.user;
        const deliveryPerson = await DeliveryPartner.findById(userId);

        if (!deliveryPerson) {
            return reply.status(404).send({ message: "Delivery Person not found" });
        }
        const order = await Order.findById(orderId);
        if (!order) {
            return reply.status(404).send({ message: "Order not found" });
        }
        if (['cancelled', 'delivered'].includes(order.status)) {
            return reply.status(404).send({ message: "Order cannot be updated" });
        }
        if (order.deliveryPartner.toString() !== userId) {
            return reply.status(403).send({ message: "Unauthorized" });
        }
        order.status = status;
        order.deliveryPartner = userId;
        order.deliveryPersonLocation = deliveryPeronLocation;
        await order.save();

        req.server.io.to(orderId).emit("liveTrackingUpdates", order);
        return reply.send(order);

    } catch (error) {
        return reply.status(500).send({ message: "Failed to update Order status", error });
    }
};

export const getOrders = async (req, reply) => {
    try {

        const { status, customerId, deliveryPartnerId, branchId } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }
        if (customerId) {
            query.customerId = customerId;
        }
        if (deliveryPartnerId) {
            query.deliveryPartnerId = deliveryPartnerId;
            query.branch = branchId;
        }
        const orders = await Order.find(query).populate(
            "customer branch item.item deliveryPartner"
        )
        return reply.send(orders);

    } catch (error) {
        return reply.status(500).send({ message: "Failed to retrueve orders", error });
    }
};
export const getOrderByID = async (req, reply) => {
    try {

        const { orderId } = req.query;
        const order = await Order.findById(orderId).populate(
            "customer branch item.item deliveryPartner"
        )
        if (!order) {
            return reply.status(404).send({ message: "Order not found" });
        }

        return reply.send(order);

    } catch (error) {
        return reply.status(500).send({ message: "Failed to retrueve orders", error });
    }
};