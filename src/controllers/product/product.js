import Product  from "../../models/product.js";

export const getProductsByCategoryId = async (req, reply) => {
    try {
        const products = await Product.find({ category: categoryId }).select("-category").exec();
        return reply.send(products);
    } catch (error) {
        return reply.status(500).send({ message: "An error Occurred" });
    }
};