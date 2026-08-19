import { movieDb } from "../config/movieDB.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  path: "/",
};

export const authMiddleware = async (req, res, next) => {
  console.log("=AUTH =");
  console.log("Cookies:", req.cookies);

  try {
    const token = req.cookies["access-token"];

    console.log("Access Token:", token);

    if (!token) {
      console.log("NO TOKEN");
      return res.status(401).json({
        error: "Unauthorized - No token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded:", decoded);

    const userResult = await movieDb.query(
      `SELECT id, name, email, public_id, role
       FROM users
       WHERE id = $1`,
      [decoded.id],
    );

    console.log("User Result:", userResult.rows);

    if (userResult.rows.length === 0) {
      console.log("USER NOT FOUND");
      return res.status(401).json({
        error: "Unauthorized - User not found",
      });
    }

    req.user = userResult.rows[0];

    console.log("AUTH SUCCESS");

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);

    return res.status(401).json({
      error: "Unauthorized - Invalid token",
    });
  }
};

export const accessTokenGeneration = async (req, res) => {
  try {
    const accessToken = req.cookies["access-token"];
    const refreshToken = req.cookies["refresh-token"];

    // Access token still valid
    if (accessToken) {
      try {
        jwt.verify(accessToken, process.env.JWT_SECRET);

        return res.status(200).json({
          message: "Access token valid",
        });
      } catch (err) {
        console.log("Access token expired");
      }
    }

    // No refresh token
    if (!refreshToken) {
      return res.status(401).json({
        error: "No refresh token",
      });
    }

    // Validate refresh token
    const storedToken = await movieDb.query(
      `SELECT *
   FROM nxtwatch_refresh_tokens
   WHERE token = $1`,
      [refreshToken],
    );

    if (storedToken.rows.length === 0) {
      return res.status(403).json({
        error: "Invalid refresh token",
      });
    }

    const userId = storedToken.rows[0].user_id;

    const userResult = await movieDb.query(
      `SELECT id, name, email, public_id, role
   FROM users
   WHERE id = $1`,
      [userId],
    );

    const user = userResult.rows[0];

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        public_id: user.public_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.cookie("access-token", newAccessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "New access token generated",
    });
  } catch (err) {
    console.log("ACCESS TOKEN ERROR:", err.message);

    return res.status(500).json({
      error: "Server error",
    });
  }
};
