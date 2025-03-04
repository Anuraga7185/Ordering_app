import mongoose from "mongoose";
import Counter from "./counter.js";

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,

    },
    deliveryPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryPartner",
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    },
    items: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"

        },
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        count: { type: Number },
    },
    ],
    deliveryLocation: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String },
    },
    pickupLocation: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String },
    },
    deliveryPersonLocation: {
        latitude: { type: Number},
        longitude: { type: Number },
        address: { type: String },
    },
    status: {
        type: String,
        enum: ["available", "confirmed", "arriving", "delivered", "cancelled"],
        default: "available",
    },
    totalPrice: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    udatedAt: { type: Date, default: Date.now },
});

async function getNextSequenceValue(sequenceName) {
    const sequenceDocument = await Counter.findOneAndUpdate(
        { name: sequenceName },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );
    console.log("sequence",sequenceDocument);
    return sequenceDocument.sequence_value;
}

orderSchema.pre("save", async function (next) {
    if (this.isNew) {
        console.error("Order creation");
        const sequenceValue = await getNextSequenceValue("orderId");
        this.orderId = `ORDR${sequenceValue.toString().padStart(5, "0")}`;
    }
    next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;