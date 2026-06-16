import { movieDb } from "../config/movieDB.js";

export const currentSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionsResult = await movieDb.query(
      `SELECT token, created_at FROM nxtwatch_refresh_tokens WHERE user_id = $1`,
      [userId],
    );
    const sessions = sessionsResult.rows.map((session) => ({
      token: session.token,
      createdAt: session.created_at,
    }));

    console.log("CURRENT SESSIONS:", sessions);
    return res.status(200).json({ sessions });
  } catch (err) {
    console.log("CURRENT SESSIONS ERROR:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
