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
    if (user) {
      return res.status(400).json({ error: "user already exists" });
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

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      public_id: user.public_id,
    };

    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 360000000,
    });

    return res
      .status(200)
      .json({ message: "Login successful", token: jwtToken, user: payload });
  } catch (err) {
    console.log(err);
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.log(err);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const userResult = await movieDb.query(
      `SELECT id, name, email, public_id FROM users WHERE id = $1`,
      [userId],
    );

    return res.status(200).json({ user: userResult.rows[0] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error fetching user" });
  }
};
