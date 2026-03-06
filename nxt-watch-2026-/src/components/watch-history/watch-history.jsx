import axios from "axios";

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../header";
import "./watch-history.css";
import { HiDotsVertical } from "react-icons/hi";

const WatchHistory = () => {
  const [watchHistory, setWatchHistory] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchWatchHistory();
  }, []);

  const fetchWatchHistory = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/get-watch-history",
        {
          withCredentials: true,
        },
      );

      const formattedList = res.data.watchHistory.map((movie) => ({
        id: movie.id,
        title: movie.title,
        releaseYear: movie.release_year,

        backdropPath: movie.backdroppath,
        watchedAt: movie.watchedAt,
        movieEmbedding: movie.vector_embedding,
      }));

      setWatchHistory(formattedList);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredWatchHistory = useMemo(() => {
    if (input) {
      return watchHistory.filter((movie) =>
        movie.title.toLowerCase().includes(input.toLowerCase()),
      );
    } else {
      return watchHistory;
    }
  }, [input, watchHistory]);

  const deleteMovie = async (movieId) => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/delete-movie/${movieId}`,
        {
          withCredentials: true,
        },
      );
      alert(res.data.message);
      fetchWatchHistory();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteAll = async () => {
    try {
      const res = await axios.delete(
        "http://localhost:5000/api/delete-full-watch-history",
        {
          withCredentials: true,
        },
      );

      alert(res.data.message);
      fetchWatchHistory()
    } catch (err) {
      document.alert(err);
    }
  };

  return (
    <div>
      <div className="delete-section">
        <input
          type="search"
          className="watch-hisory-search"
          placeholder="search..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="delete-full" onClick={deleteAll}>
          Delete All
        </button>
      </div>
      <ul className="grid-container">
        {[...filteredWatchHistory].slice(0, 12).map((movie) => (
          <li
            className="indivisual-movie-container"
            style={{
              marginBottom: "20px",
              backgroundImage: `url(https://image.tmdb.org/t/p/w500${movie.backdropPath})`,
              backgroundSize: "cover",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              backgroundPosition: "center",
              padding: "10px 0px",
              borderRadius: "10px",
              color: "white",
            }}
            onClick={() =>
              navigate(
                `/trending/${encodeURIComponent(movie.title)}/${movie.id}`,
              )
            }
            key={movie.id}
            to={`/trending/${encodeURIComponent(movie.title)}/${movie.id}`}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                height: "100%",
              }}
            >
              <HiDotsVertical
                onClick={() => {
                  setActiveMenu((prev) =>
                    prev === movie.id ? null : movie.id,
                  );
                }}
                className="dots"
              />
            </div>
            {activeMenu === movie.id && (
              <div onClick={(e) => e.stopPropagation()}>
                <button onClick={() => deleteMovie(movie.id)}>Delete</button>
                <button>Watch Later</button>
              </div>
            )}

            <div className="sm-p">
              <div className="sm-div">
                <h4
                  className="movie-title"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  {movie.title}
                </h4>
              </div>

              <div className="sm-div">
                <h4>{movie.releaseYear}</h4>
              </div>
              <div>
                {new Date(movie.watchedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WatchHistory;
