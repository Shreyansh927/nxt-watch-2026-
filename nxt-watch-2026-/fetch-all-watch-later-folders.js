import axios from "axios";

const fetchWatchLaterFolders = async (movieId ,movieName) => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/get-watch-later-folders",
      {
        withCredentials: true,
      },
    );

    const formattedData = res.data.results.map((folder) => ({
      folderId: folder.id,
      folderName: folder.watch_later_folder_name,
      folderStatus: folder.watch_later_folder_status,
      createdAt: folder.created_at,
    }));

    return { r: formattedData, m: movieId, n: movieName };
  } catch (err) {
    console.log(err);
  }
};

export default fetchWatchLaterFolders;
