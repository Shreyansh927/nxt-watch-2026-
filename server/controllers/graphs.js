import { movieDb } from "../config/movieDB.js";

export const playlistData = async (req, res) => {
  try {
    const userId = req.user.id;
    const eachFolderTotalFiles = await movieDb.query(
      `
        SELECT watch_later_folders.watch_later_folder_name as "folder_name", COUNT(watch_later_files.id) AS "total_count"
        FROM watch_later_folders
        LEFT JOIN watch_later_files ON watch_later_folders.id = watch_later_files.folder_id
        WHERE watch_later_folders.user_id = $1
        GROUP BY watch_later_folders.id
         `,
      [userId],
    );
    return res.status(200).json({
      results: eachFolderTotalFiles.rows,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
};

export const continueWatching = async (req, res) => {
  try {
    const userId = req.user.id;
    const lastWatched = await movieDb.query(
      `SELECT movies.id as "id", movies.title as "title", movies.release_year as "releaseYear", movies.movielink as "movieLink", movies.posterpath as "backdrop", watch_history.watched_at as "watched_at" from watch_history INNER JOIN movies ON watch_history.movie_id = movies.id WHERE watch_history.user_id = $1 ORDER BY watch_history.watched_at DESC LIMIT 1`,
      [userId],
    );
    console.log(lastWatched.rows[0]);

    return res.status(200).json({ result: lastWatched.rows[0] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};
