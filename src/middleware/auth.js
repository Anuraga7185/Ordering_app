import jwt from "jsonwebtoken";

export const verifyToken = async (req, reply) => {
    try {
        console.log("token");
        const authHeader = req.headers['authorization']
        console.log("authHeader");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return reply.status(401).send({ message: "Access token required" })

        }
        console.log("token");
        const token = authHeader.split(" ")[1]
        
        console.log("token `$token`");
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        return true;

    } catch (error) {
        return reply.status(403).send({ message: "Invalid or expired token" })
    }
}