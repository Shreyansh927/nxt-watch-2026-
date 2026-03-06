import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";

const WatchLaterFiles = () => {
  const { folderId } = useParams();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchAllFolderFiles();
  }, []);

  const fetchAllFolderFiles = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/get-watch-later-folder-files/${folderId}`,
        {
          withCredentials: true,
        },
      );
      setFiles(res.data.result);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div>
      <h1>all watch files {folderId}</h1>
      <ul className="grid-container">
        {files.map((movie) => (
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
              {/* <HiDotsVertical
                onClick={() => {
                  setActiveMenu((prev) =>
                    prev === movie.id ? null : movie.id,
                  );
                }}
                className="dots"
              /> */}
            </div>
            {/* {activeMenu === movie.id && (
              <div onClick={(e) => e.stopPropagation()}>
                <button onClick={() => deleteMovie(movie.id)}>Delete</button>
                <button>Watch Later</button>
              </div>
            )} */}

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
                {new Date(movie.addedAt).toLocaleDateString("en-IN", {
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

export default WatchLaterFiles;
