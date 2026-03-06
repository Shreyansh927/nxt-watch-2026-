import { movieDb } from "../config/movieDB.js";

export const postComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId, content } = req.body;
    await movieDb.query(
      `INSERT INTO comments (user_id, movie_id, content) VALUES ($1, $2, $3)`,
      [userId, movieId, content],
    );
    return res.status(200).json({ message: "comment sent successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};

export const fetchAllMovieComments = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { rows } = await movieDb.query(
      `SELECT users.name as name, users.public_id as public_id, comments.created_at as posted_at, comments.content as content FROM comments INNER JOIN users ON comments.user_id = users.id WHERE comments.movie_id = $1 ORDER BY comments.created_at DESC`,
      [movieId],
    );

    return res.status(200).json({ result: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};
