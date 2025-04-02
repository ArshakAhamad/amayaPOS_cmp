import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", ""); // Extract token from the Authorization header

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token with your secret key
    req.user = decoded; // Attach the decoded user information to the request object
    next(); // Allow the request to proceed to the next middleware or route handler
  } catch (err) {
    return res.status(400).json({ success: false, message: "Invalid token." });
  }
};

export default authenticateToken;
