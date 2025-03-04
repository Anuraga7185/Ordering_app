import Order from "../../models/Order.js";
import Branch from "../../models/branch.js";
import { Customer, DeliveryPartner } from "../../models/user.js"



export const createOrder = async (req, reply) => {
    try {
        const { userId } = req.user;
        const { items, branch, totalPrice } = req.body;
console.log(userId);
const branchData = await Branch.findById(branch);
console.log(branchData);
        const customerData = await Customer.findById(userId);
        console.log("here");
    
        console.log(customerData);
        if (!customerData) {
            reply.send({ message: "Customer not found" });
            return ;
            // return reply.status(404).send({ message: "Customer not found" });
        }
        console.log("here3");
        const newOrder = new Order({
            customer: userId,
            items: items.map((item) => ({
                id: item.id,
                item: item.item,
                count: item.count
            })),
            branch,
            totalPrice: totalPrice,
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
        console.log("save....");
        console.log(newOrder);
        const savedOrder = await newOrder.save();
        console.log("save2");
         return reply.send(savedOrder);


    } catch (error) {
        console.error("Order creation error:", error);
        return reply.status(500).send({ message: "An error Occurred", error });
    }
};
export const confirmOrder = async (req, reply) => {
    try {
        const { orderId } = req.params;
        console.log("here");
        const { userId } = req.user;
        console.log("userId");
        const { deliveryPersonLocation } = req.body;
        console.log("deliveryPeronLocation");
        console.log("Order connfirmation", orderId," ",userId," ",deliveryPersonLocation);
        const deliveryPerson = await DeliveryPartner.findById(userId);
        console.log(deliveryPerson);
        if (!deliveryPerson) {
            console.log("deliveryPerson");
            return reply.status(404).send({ message: "delivery Person not found" });
        }
        console.log("deliveryPerson found",orderId);
        const order = await Order.findOne({orderId});
        console.log(order);
        if (!order) {
            return reply.status(404).send({ message: "Order not found" });
        }
        if (order.status !== 'available') {
            return reply.statuS(404).send({ message: "Order is not available" });
        }
        order.status = 'confirmed'
        order.deliveryPartner = userId;
        order.deliveryPersonLocation = {
            latitude: deliveryPersonLocation?.latitude,
            longitude: deliveryPersonLocation?.longitude,
            address: deliveryPersonLocation.address || ""
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
        console.log("here.");
        const { status, customerId, deliveryPartnerId, branchId } = req.query;
        console.log("here..");
        let query = {};
        console.log("here.");
        if (status) {
            query.status = status;
        }
        if (customerId) {
            query.customerId = customerId;
        }
        console.log("here",query);
        if (deliveryPartnerId) {
            query.deliveryPartnerId = deliveryPartnerId;
            query.branch = branchId;
        }
        const orders = await Order.find(query).populate(
            "customer branch items.item deliveryPartner"
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
            "customer branch items.item deliveryPartner"
        )
        if (!order) {
            return reply.status(404).send({ message: "Order not found" });
        }

        return reply.send(order);

    } catch (error) {
        return reply.status(500).send({ message: "Failed to retrueve orders", error });
    }
};