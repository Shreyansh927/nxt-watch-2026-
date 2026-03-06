import { movieDb } from "../config/movieDB.js";

export const likeMovie = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    const like = await movieDb.query(
      `SELECT id FROM likes WHERE user_id=$1 AND movie_id = $2`,
      [userId, movieId],
    );
    const disliked = await movieDb.query(
      `SELECT id FROM dislikes WHERE user_id=$1 AND movie_id = $2`,
      [userId, movieId],
    );
    if (!like.rows.length) {
      await movieDb.query(
        `INSERT INTO likes (user_id, movie_id)
  VALUES ($1, $2)
  ON CONFLICT (user_id, movie_id)
  DO NOTHING`,
        [userId, movieId],
      );

      if (disliked.rows.length) {
        await movieDb.query(
          `DELETE FROM dislikes WHERE user_id = $1 AND movie_id=$2`,
          [userId, movieId],
        );
      }
      return res.status(200).json({ message: "liked the movie" });
    }

    await movieDb.query(
      `DELETE FROM likes WHERE user_id = $1 AND movie_id=$2`,
      [userId, movieId],
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};

export const dislikeMovie = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    const dislike = await movieDb.query(
      `SELECT id FROM dislikes WHERE user_id=$1 AND movie_id = $2`,
      [userId, movieId],
    );
    const liked = await movieDb.query(
      `SELECT id FROM likes WHERE user_id=$1 AND movie_id = $2`,
      [userId, movieId],
    );
    if (!dislike.rows.length) {
      await movieDb.query(
        `INSERT INTO dislikes (user_id, movie_id)
  VALUES ($1, $2)
  ON CONFLICT (user_id, movie_id)
  DO NOTHING`,
        [userId, movieId],
      );

      if (liked.rows.length) {
        await movieDb.query(
          `DELETE FROM likes WHERE user_id = $1 AND movie_id=$2`,
          [userId, movieId],
        );
      }
      return res.status(200).json({ message: "disliked the movie" });
    }

    await movieDb.query(
      `DELETE FROM dislikes WHERE user_id = $1 AND movie_id=$2`,
      [userId, movieId],
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};

export const fetchAllMovieLikeCount = async (req, res) => {
  try {
    const userID = req.user.id;
    const { movieId } = req.params;
    const counts = await movieDb.query(
      `SELECT COUNT(id) as count FROM likes WHERE movie_id = $1`,
      [movieId],
    );
    const userId = await movieDb.query(
      `select user_id from likes where user_id = $1 and movie_id = $2`,
      [userID, movieId],
    );
    return res
      .status(200)
      .json({ result: counts.rows[0].count, isPresent: userId.rows[0] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};

export const fetchAllMoviedislikeCount = async (req, res) => {
  try {
    const userID = req.user.id;
    const { movieId } = req.params;
    const counts = await movieDb.query(
      `SELECT COUNT(id) as count FROM dislikes WHERE movie_id = $1`,
      [movieId],
    );
    const userId = await movieDb.query(
      `select user_id from dislikes where user_id = $1 and movie_id = $2`,
      [userID, movieId],
    );
    return res
      .status(200)
      .json({ result: counts.rows[0].count, isPresent: userId.rows[0] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};
