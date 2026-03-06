import { movieDb } from "../config/movieDB.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized - No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userResult = await movieDb.query(
      `SELECT id, name, email, public_id FROM users WHERE id = $1`,
      [decoded.id],
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Unauthorized - User not found" });
    }

    req.user = userResult.rows[0];

    next();
  } catch (err) {
    console.log("AUTH ERROR:", err.message);
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};
