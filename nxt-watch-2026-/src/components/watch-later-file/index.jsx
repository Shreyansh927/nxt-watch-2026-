import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import "./index.css";
import Recharts from "../recharts/index.jsx";

const WatchLaterFiles = () => {
  const { folderId } = useParams();
  const [searchParams] = useSearchParams();
  const publicId = searchParams.get("publicId");
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllFolderFiles();
  }, []);

  const fetchAllFolderFiles = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/get-watch-later-folder-files/${folderId}`,

        {
          params: publicId ? { publicId } : {},
          withCredentials: true,
        },
      );
      setFiles(res.data.result);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="watch-later-files-page">
      {/* Hero Section */}
      <section className="wl-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="folder-title">Watch Later Collection</h1>
            <p className="folder-subtitle">
              Your curated selection of movies to watch
            </p>
            <div className="folder-stats">
              <span className="stat-item">
                <strong>{files.length}</strong> movies saved
              </span>
              <span className="stat-divider">•</span>
              <span className="stat-item">Folder ID: {folderId}</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                  fill="currentColor"
                />
                <path
                  d="M12 6L12.72 8.28L15 9L12.72 9.72L12 12L11.28 9.72L9 9L11.28 8.28L12 6Z"
                  fill="currentColor"
                  opacity="0.6"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Recharts Analytics Section */}
      <section className="recharts-wrapper">
        <Recharts />
      </section>

      {/* Movies Grid Section */}
      <section className="movies-section">
        {files.length === 0 ? (
          <div className="wl-empty">
            <div className="empty-content">
              <div className="empty-icon">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                    fill="currentColor"
                    opacity="0.3"
                  />
                  <path
                    d="M12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2 className="empty-title">No movies saved yet</h2>
              <p className="empty-description">
                Start building your watch later collection by adding movies to
                this folder.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="section-header">
              <h2 className="section-title">Your Saved Movies</h2>
              <p className="section-description">
                Click on any movie to start watching
              </p>
            </div>
            <ul className="grid-container">
              {files.map((movie) => (
                <li
                  className="indivisual-movie-container"
                  style={{
                    backgroundImage: `url(${movie.backdropPath})`,
                  }}
                  onClick={() =>
                    navigate(
                      `/trending/${encodeURIComponent(movie.title)}/${movie.id}`,
                    )
                  }
                  key={movie.id}
                >
                  <div className="movie-overlay">
                    <button
                      className="dots"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle menu toggle here
                      }}
                      aria-label="More options"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="sm-p">
                    <div className="sm-div">
                      <h4 className="movie-title">{movie.title}</h4>
                    </div>

                    <div className="sm-div">
                      <span className="release-year">{movie.releaseYear}</span>
                    </div>

                    <div className="date">
                      Added{" "}
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
          </>
        )}
      </section>
    </div>
  );
};

export default WatchLaterFiles;
