import { movieDb } from "../config/movieDB.js";

export const addToWatchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId, movieEmbedding } = req.body;
    if (!movieId) {
      return res.status(400).json({ error: "Missing movieId" });
    }
    const result = await movieDb.query(
      `SELECT * FROM watch_history WHERE user_id =$1 AND movie_id = $2`,
      [userId, movieId],
    );
    if (result) {
      await movieDb.query(
        `UPDATE watch_history SET watched_at=  NOW() WHERE movie_id = $1 AND user_id = $2`,
        [movieId, userId],
      );
    } 

    await movieDb.query(
      `INSERT INTO watch_history (user_id, movie_id, vector_embedding) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [userId, movieId, movieEmbedding],
    );

    return res
      .status(200)
      .json({ message: `${movieId} added to watch history` });
  } catch (err) {
    console.error("Error adding to watch history:", err);
    return res.status(500).json({ error: "Error adding to watch history" });
  }
};

export const getWatchHistory = async (req, res) => {
  try {
    const userID = req.user.id;
    const result = await movieDb.query(
      `SELECT movies.id as id, movies.title as title, movies.release_year as releaseYear, movies.backdropPath as backdropPath, watch_history.watched_at as "watchedAt" from watch_history INNER JOIN movies ON watch_history.movie_id = movies.id where watch_history.user_id = $1 order by watched_at desc`,
      [userID],
    );
    return res.status(200).json({
      message: "watch_history fetched successfully",
      watchHistory: result.rows,
    });
  } catch (err) {
    return res.status(500).json({ error: "Error fetching watch history" });
  }
};

export const deleteWatchhistoryVideo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    await movieDb.query(
      `DELETE FROM watch_history WHERE user_id = $1 AND movie_id =$2`,
      [userId, movieId],
    );
    return res.status(200).json({ message: "movie deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};

export const deleteFullWatchHistory = async (req, res) => {
  try {
    const useId = req.user.id;

    await movieDb.query(`DELETE FROM watch_history WHERE user_id = $1`, [
      useId,
    ]);

    return res
      .status(200)
      .json({ message: "watch history deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};
