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
    const res = await axios.get("http://localhost:5000/api/discover-tv", {
      params: {
        with_genres: 35,
        page: pageParam,
      },
      withCredentials: true,
    });

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
        <ul className="grid-container watch-layout">
          {[...Array(10)].map((_, index) => (
            <li key={index} className="loading-card" />
          ))}
        </ul>
      );
    }

    if (isError) {
      return <p>Error fetching movies</p>;
    }

    return (
      <>
        {watchLaterMode && (
          <ul className="watch-later-folders">
            <h3 className="h3">Save too...</h3>
            <input
              type="search"
              value={searchPlaylist}
              onChange={(e) => setSearchPlaylist(e.target.value)}
              placeholder="search playlist..."
              className="search-playlist"
            />
            <div className="ff">
              {filteredPlaylist.map((m) => (
                <div className="folder-card" key={m.folderId}>
                  <div>
                    <h3>{m.folderName}</h3>
                    <p className="status">{m.folderStatus}</p>
                  </div>
                  <MdPlaylistAddCircle
                    className="icon-save"
                    style={{ fontSize: "30px" }}
                  />
                </div>
              ))}
            </div>
          </ul>
        )}

        <ul
          className="grid-container"
          onClick={() => setWatchLaterMode(false)}
          style={{ paddingRight: "30px" }}
        >
          {animes.map((movie) => (
            <Link
              key={movie.id}
              to={`/trending/${encodeURIComponent(movie.title)}/${movie.id}`}
              style={{ textDecoration: "none", listStyle: "none" }}
              onClick={() => addToWatchHistory(movie.id, movie.embedding)}
            >
              <li
                className="indivisual-movie-container"
                style={{
                  marginBottom: "20px",
                  listStyle: "none",
                  backgroundImage: `url(https://image.tmdb.org/t/p/original/${movie.backdropPath})`,
                  backgroundSize: "cover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  backgroundPosition: "center",
                  padding: "30px 0px",
                  borderRadius: "10px",
                  color: "white",
                }}
              >
                <div
                  onClick={(e) => {
                    e.preventDefault();
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
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {!watchLaterMode && (
                      <button onClick={renderWatchLaters}>Watch Later</button>
                    )}
                  </div>
                )}
                <div className="sm-p">
                  <div className="sm-div">
                    <h4 className="movie-title">{movie.title}</h4>
                  </div>
                  <div className="sm-div">
                    <h4>{movie.releaseYear}</h4>
                  </div>
                </div>
              </li>
            </Link>
          ))}
        </ul>

        <div ref={loaderRef} style={{ height: "40px" }} />

        {isFetchingNextPage && (
          <div className="loading-container">
            <Loader type="ThreeDots" color="black" height="50" width="50" />
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div>{renderAnime()}</div>
    </>
  );
};

export default Tv;
