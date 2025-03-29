import Product  from "../../models/product.js";

export const getProductsByCategoryId = async (req, reply) => {
    try {
        console.log("Products Categories `{categoryId}`");
        console.log(req);
        const { categoryId } = req.params; // ✅ Extract categoryId
        const products = await Product.find({ category: categoryId }).select("-category").exec();
        console.log("Products Categories Found");
        return reply.send(products);
    } catch (error) {
        return reply.status(500).send({ message: "An error Occurred" });
    }
};