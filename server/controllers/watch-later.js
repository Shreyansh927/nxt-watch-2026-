import { movieDb } from "../config/movieDB.js";

export const addWatchLaterFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderName, folderStatus } = req.body;

    await movieDb.query(
      `INSERT INTO watch_later_folders (user_id, watch_later_folder_name, watch_later_folder_status, created_at) VALUES ($1, $2, $3, NOW())`,
      [userId, folderName, folderStatus],
    );

    return res.status(200).json({
      message: "folder add to watch later successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "error in adding folder" });
  }
};

export const fetchAllWatchLaterFolders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await movieDb.query(
      `SELECT * FROM watch_later_folders WHERE user_id = $1 ORDER BY created_at`,
      [userId],
    );
    // console.log(rows);
    return res.status(200).json({ results: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};

export const getWatchLaterPublicPlaylistsWithPublicId = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { rows } = await movieDb.query(
      `SELECT watch_later_folders.id as "folderId", watch_later_folders.watch_later_folder_name as "folderName", watch_later_folders.created_at as "createdAt" FROM watch_later_folders INNER JOIN users ON watch_later_folders.user_id = users.id WHERE users.public_id = $1 AND watch_later_folders.watch_later_folder_status = 'PUBLIC'`,
      [publicId],
    );

    console.log(rows);

    return res.status(200).json({ publicLists: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};

export const updateWatchLaterFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderId, folderName, folderStatus } = req.body;

    await movieDb.query(
      `UPDATE watch_later_folders SET watch_later_folder_name = $1, watch_later_folder_status = $2, created_at = NOW() WHERE user_id = $3 AND id = $4`,
      [folderName, folderStatus, userId, folderId],
    );

    return res.status(200).json({ message: "folder updated successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};

export const addMovieToWatchLaterFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderId, movieId, FolderName, MovieName } = req.body;
    await movieDb.query(
      `INSERT INTO watch_later_files (user_id, folder_id, movie_id, added_at, folder_name , movie_name) VALUES ($1, $2, $3, NOW(), $4 ,$5)`,
      [userId, folderId, movieId, FolderName, MovieName],
    );
    return res.status(200).json({
      message: `${movieId} is successfully added to folderID ${folderId}`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};

export const getAllWatchLaterFolderFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderId } = req.params;
    const {publicId} = req.query

    if (publicId){
      const user = await movieDb.query(`SELECT * FROM users WHERE public_id = $1`, [publicId])
      const userIdFromPublicId = user.rows[0].id
      const folder = await movieDb.query(`SELECT * FROM watch_later_folders WHERE id = $1 AND user_id = $2 AND watch_later_folder_status = 'PUBLIC'`, [folderId, userIdFromPublicId])

      if (folder.rows.length === 0){
        return res.status(404).json({ message: "Folder not found or is not public" });
      }
      const { rows } = await movieDb.query(
        `SELECT movies.title as "title" ,movies.id as id, movies.release_year as "releaseYear", movies.backdroppath as "backdropPath", watch_later_files.added_at as "addedAt"  FROM watch_later_files INNER JOIN movies ON watch_later_files.movie_id = movies.id WHERE watch_later_files.user_id = $1 AND watch_later_files.folder_id = $2`,
        [userIdFromPublicId, folderId],
      );

      console.log(rows);

      return res.status(200).json({ result: rows });

    }
    const { rows } = await movieDb.query(
      `SELECT movies.title as "title" ,movies.id as id, movies.release_year as "releaseYear", movies.backdroppath as "backdropPath", watch_later_files.added_at as "addedAt"  FROM watch_later_files INNER JOIN movies ON watch_later_files.movie_id = movies.id WHERE watch_later_files.user_id = $1 AND watch_later_files.folder_id = $2`,
      [userId, folderId],
    );

    return res.status(200).json({ result: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};
