import { use } from "react";
import { movieDb } from "../config/movieDB.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const signUp = async (req, res) => {
  try {
    const { name, email, password, public_id } = req.body;

    if (!name || !email || !password || !public_id) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const existingUser = await movieDb.query(
      `
        SELECT * FROM users WHERE email = $1
        `,
      [email],
    );

    const user = existingUser.rows[0];

    const emailCheck = await movieDb.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
    );
    if (emailCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    const publicIdCheck = await movieDb.query(
      `SELECT * FROM users WHERE public_id = $1`,
      [public_id],
    );

    if (publicIdCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User with this public ID already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await movieDb.query(
      `INSERT INTO users (name, email, password_hash, public_id) VALUES ($1, $2, $3, $4)`,
      [name, email, hashedPassword, public_id],
    );

    return res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error signing up" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const existingUser = await movieDb.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
    );

    if (!existingUser) {
      return res.status(400).json({ error: "User does not exist" });
    }

    const user = existingUser.rows[0];
    const passswordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passswordMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const randomRefreshToken = Math.random().toString(36).substring(2);
    console.log(randomRefreshToken);

    const randomAccessToken = Math.random().toString(36).substring(2);
    console.log(randomAccessToken);

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      public_id: user.public_id,
    };

    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });

    res.cookie("access-token", jwtToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 15 * 1000,
      path: "/",
    });

    res.cookie("refresh-token", randomRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 360000000,
      path: "/",
    });

    await movieDb.query(
      `INSERT INTO nxtwatch_refresh_tokens (user_id, token) VALUES ($1, $2)`,
      [user.id, randomRefreshToken],
    );

    return res.status(200).json({ message: "Login successful", user: payload });
  } catch (err) {
    console.log(err);
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("access-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.clearCookie("refresh-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    await movieDb.query(
      `DELETE FROM nxtwatch_refresh_tokens WHERE token = $1 `,
      [req.cookies["refresh-token"]],
    );

    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.log(err);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await movieDb.query(
      `SELECT id, name, email, public_id, profile_image FROM users WHERE id = $1`,
      [userId],
    );

    return res.status(200).json({ user: userResult.rows[0] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error fetching user" });
  }
};
