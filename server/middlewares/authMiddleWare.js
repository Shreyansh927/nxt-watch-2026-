import { movieDb } from "../config/movieDB.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies["access-token"];

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

    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }

    req.user = userResult.rows[0];

    next();
  } catch (err) {
    console.log("AUTH ERROR:", err.message); // 👈 ADD THIS
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};

export const accessTokenGeneration = async (req, res) => {
  console.log("Cookies received:", req.cookies);
  console.log("Refresh Token:", req.cookies["refresh-token"]);
  try {
    console.log("ACCESS TOKEN ROUTE HIT");

    const accessToken = req.cookies["access-token"];
    const refreshToken = req.cookies["refresh-token"];

    // If access token exists → verify it
    if (accessToken) {
      try {
        jwt.verify(accessToken, process.env.JWT_SECRET);
        return res.status(200).json({ message: "Access token valid" });
      } catch (err) {
        console.log("Access token expired → generating new one");
      }
    }

    // If no refresh token → unauthorized
    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token" });
    }
    console.log("Cookies:", req.cookies);
    console.log("Refresh Token:", req.cookies["refresh-token"]);

    // Validate refresh token in DB
    const storedToken = await movieDb.query(
      `SELECT * FROM nxtwatch_refresh_tokens 
       WHERE token = $1 AND revoked = false AND expires_at > NOW()`,
      [refreshToken],
    );

    if (storedToken.rows.length === 0) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const userId = storedToken.rows[0].user_id;

    
    const newAccessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.cookie("access-token", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 45 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({ message: "New access token generated" });
  } catch (err) {
    console.log("ACCESS TOKEN ERROR:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};
