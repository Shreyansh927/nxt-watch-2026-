import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaSearchengin } from "react-icons/fa";
import Loader from "react-loader-spinner";
import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import "./index.css";
import Header from "../header/index";
import addToWatchHistory from "../../../add-to-watch-history";
import { HiDotsVertical } from "react-icons/hi";
import fetchWatchLaterFolders from "../../../fetch-all-watch-later-folders";
import { MdPlaylistAddCircle } from "react-icons/md";
import AiAssistant from "../natural-language-command-system-ai";

const Tv = () => {
  const loaderRef = useRef(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [latestWatchLaters, setLatestWatchLaters] = useState([]);
  const [watchLaterMode, setWatchLaterMode] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [searchPlaylist, setSearchPlaylist] = useState("");

  const renderWatchLaters = async () => {
    setWatchLaterMode(true);
    const res = await fetchWatchLaterFolders();
    setLatestWatchLaters(res);
  };

  /* ---------------- Fetch Anime ---------------- */

  const fetchAnime = async ({ pageParam = 1 }) => {
    const res = await axios.get(
      `${import.meta.env.VITE_SERVER_URL}/api/discover-tv`,
      {
        params: {
          with_genres: 35,
          page: pageParam,
        },
        withCredentials: true,
      },
    );

    const formattedMovies = res.data.movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      releaseYear: movie.release_year,
      description: movie.description,
      genre: movie.genre,
      posterPath: movie.posterpath,
      backdropPath: movie.backdroppath,
      originalTitle: movie.title,
      embedding: movie.vector_embedding,
    }));

    return formattedMovies;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["movies"],
    queryFn: fetchAnime,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 20 ? pages.length + 1 : undefined;
    },
  });

  const animes = data?.pages?.flat() || [];

  const filteredPlaylist = useMemo(() => {
    return latestWatchLaters.filter((f) =>
      f.folderName.toLowerCase().includes(searchPlaylist.toLowerCase()),
    );
  }, [latestWatchLaters, searchPlaylist]);

  /* ---------------- Infinite Scroll ---------------- */

  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchNextPage();
      }
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  const renderAnime = () => {
    if (isLoading) {
      return (
        <div className="tv-page">
          <section className="tv-hero">
            <div className="hero-content">
              <h1 className="hero-title">TV Shows</h1>
              <p className="hero-subtitle">
                Explore the best TV shows and series
              </p>
            </div>
          </section>

          <section className="movies-section">
            <div className="section-header">
              <h2 className="section-title">Loading amazing TV shows...</h2>
            </div>
            <ul className="grid-container">
              {[...Array(12)].map((_, index) => (
                <li key={index} className="loading-card">
                  <div className="loading-skeleton"></div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="tv-page">
          <section className="tv-hero">
            <div className="hero-content">
              <h1 className="hero-title">TV Shows</h1>
              <p className="hero-subtitle">
                Explore the best TV shows and series
              </p>
            </div>
          </section>

          <section className="error-section">
            <div className="error-content">
              <div className="error-icon">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                    fill="currentColor"
                    opacity="0.6"
                  />
                </svg>
              </div>
              <h2 className="error-title">Oops! Something went wrong</h2>
              <p className="error-description">
                We couldn't load the TV shows. Please try again later.
              </p>
            </div>
          </section>
        </div>
      );
    }

    return (
      <div className="tv-page">
        {/* Hero Section */}
        <AiAssistant />
        <section className="tv-hero">
          <div className="hero-content">
            <h1 className="hero-title">TV Shows</h1>
            <p className="hero-subtitle">
              Explore the best TV shows and series
            </p>
            <div className="hero-stats">
              <span className="stat-item">
                <strong>{animes.length}</strong> TV shows loaded
              </span>
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
        </section>

        {/* Watch Later Overlay */}
        {watchLaterMode && (
          <div className="watch-later-overlay">
            <div className="overlay-content">
              <div className="overlay-header">
                <h3 className="overlay-title">Save to Watch Later</h3>
                <p className="overlay-subtitle">
                  Choose a folder for this TV show
                </p>
              </div>

              <div className="search-container">
                <input
                  type="search"
                  value={searchPlaylist}
                  onChange={(e) => setSearchPlaylist(e.target.value)}
                  placeholder="Search playlists..."
                  className="search-input"
                />
                <div className="search-icon">
                  <FaSearchengin />
                </div>
              </div>

              <div className="folders-list">
                {filteredPlaylist.length === 0 ? (
                  <div className="empty-folders">
                    <p>No folders found</p>
                  </div>
                ) : (
                  filteredPlaylist.map((folder) => (
                    <div className="folder-item" key={folder.folderId}>
                      <div className="folder-info">
                        <h4 className="folder-name">{folder.folderName}</h4>
                        <span className="folder-status">
                          {folder.folderStatus}
                        </span>
                      </div>
                      <button
                        className="add-to-folder-btn"
                        onClick={() =>
                          addToWatchHistory(folder.id, folder.embedding)
                        }
                      >
                        <MdPlaylistAddCircle />
                        <span>Add</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                className="close-overlay-btn"
                onClick={() => setWatchLaterMode(false)}
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        )}

        {/* Movies Section */}
        <section className="movies-section">
          <div className="section-header">
            <h2 className="section-title">Popular TV Shows</h2>
            <p className="section-description">
              Click on any show to start watching
            </p>
          </div>

          <ul className="grid-container">
            {animes.map((movie) => (
              <li
                key={movie.id}
                className="movie-card"
                style={{
                  backgroundImage: `url(https://image.tmdb.org/t/p/original/${movie.backdropPath})`,
                }}
                onClick={() => {
                  setWatchLaterMode(false);
                  addToWatchHistory(movie.id, movie.embedding);
                }}
              >
                <Link
                  to={`/trending/${encodeURIComponent(movie.title)}/${movie.id}`}
                  className="movie-link"
                >
                  <div className="movie-overlay">
                    <button
                      className="menu-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveMenu((prev) =>
                          prev === movie.id ? null : movie.id,
                        );
                      }}
                      aria-label="More options"
                    >
                      <HiDotsVertical />
                    </button>

                    {activeMenu === movie.id && (
                      <div className="menu-dropdown">
                        <button
                          className="menu-item"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            renderWatchLaters();
                          }}
                        >
                          <MdPlaylistAddCircle />
                          <span>Watch Later</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="movie-info">
                    <div className="movie-details">
                      <h3 className="movie-title">{movie.title}</h3>
                      <div className="movie-meta">
                        <span className="release-year">
                          {movie.releaseYear}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Infinite Scroll Loader */}
          <div ref={loaderRef} className="scroll-trigger" />

          {isFetchingNextPage && (
            <div className="loading-more">
              <Loader type="ThreeDots" color="#f59e0b" height="40" width="40" />
              <p>Loading more TV shows...</p>
            </div>
          )}
        </section>
      </div>
    );
  };

  return <div className="tv-container">{renderAnime()}</div>;
};

export default Tv;
