import { movieDb } from "../config/movieDB.js";

export const adminMiddleware = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await movieDb.query(`SELECT * FROM users WHERE id = $1`, [
      userId,
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json({ error: "Unauthorized - User not found" });
    }
    if (user.rows[0].role !== "admin") {
      return res.status(403).json({ error: "Forbidden - Admins only" });
    }
    next();
  } catch (err) {
    console.log("ADMIN MIDDLEWARE ERROR:", err.message);
    return res.status(403).json({ error: "Forbidden - Admins only" });
  }
};
