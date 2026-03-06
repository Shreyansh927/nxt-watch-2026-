import axios from "axios";

const addToWatchHistory = async (movieId, movieEmbedding) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/add-to-watch-history",
      {
        movieId,
        movieEmbedding,
      },
      {
        withCredentials: true,
      },
    );
    console.log(response.data.message);
  } catch (err) {
    console.error("Error adding to watch history:", err);
  }
};

export default addToWatchHistory;
