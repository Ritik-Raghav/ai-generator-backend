import jwt from "jsonwebtoken";
import User from "../models/user.js";

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    // Check if the Authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing or invalid." });
    }

    // Extract the token from the header
    const token = authHeader.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Log for debugging (optional)
    console.log("User ID from token >>>>>", decoded.id);

    // Find the user from the database
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Attach user to the request object for future use
    req.user = user;

    // Proceed to next middleware/route handler
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default authenticate;
