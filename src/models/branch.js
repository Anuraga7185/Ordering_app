import mongoose from "mongoose";

// Base User Schema

const branchSchema = new mongoose.Schema({
    name: { type: mongoose.Schema.Types.ObjectId, required: true },
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
    },
    address: { type: String },
    deliveryPartners: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryPartner",
        }
    ]
});
const Branch = mongoose.model("Branch", branchSchema);
export default Branch;