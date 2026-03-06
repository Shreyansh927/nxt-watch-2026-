import axios from "axios";
import React, { useState } from "react";
import Header from "../header";
import { Link } from "react-router-dom";
import "./search-engine.css";
import addToWatchHistory from "../../../add-to-watch-history";
import { useEffect } from "react";
import { MdArrowOutward } from "react-icons/md";
import { use } from "react";

const SearchEngine = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [vectorSearchResults, setVectorSearchResults] = useState(
    JSON.parse(localStorage.getItem("search-results")) || [],
  );
  const [suggestions, setSuggestions] = useState([]);
  const [sMode, setSMode] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => {
    if (input.trim() !== "") {
      activeSuggestions(input);
    }
  }, 500); // 500ms is better than 2000ms for search

  return () => {
    clearTimeout(timer); // cleanup previous timer
  };
}, [input]);

  const activeSuggestions = async (query) => {
    try {
      const res = await axios.get(
        `https://corsproxy.io/?${encodeURIComponent(
          `https://serpapi.com/search?engine=google_autocomplete&q=${query}&api_key=b915f9f133fc147aa4c5689703fb6c6dbe4cb49cb6406264c3b50143565f9533`,
        )}`,
      );

      console.log("RAW RESPONSE:", res.data);

      // If proxy returns string instead of object
      const parsedData =
        typeof res.data === "string" ? JSON.parse(res.data) : res.data;

      const suggestions =
        parsedData?.suggestions || parsedData?.data?.suggestions || [];

      const formattedResponse = suggestions.map((s) => ({
        suggestion: s.value,
      }));

      setSuggestions(formattedResponse);
    } catch (err) {
      console.error("Autocomplete Error:", err.response?.data || err.message);
      setSuggestions([]);
    }
  };

  const vectorSearch = async () => {
    setVectorSearchResults([]);
    setLoading(true);
    // setYourGenreSearchResults([]);
    if (!input.trim()) {
      return;
    }
    try {
      const res = await axios.get("http://localhost:5000/api/vector-search", {
        params: {
          query: input,
        },
        withCredentials: true,
      });

      const formattedMovies = res.data.results.map((movie) => ({
        id: movie.id,
        title: movie.title,
        releaseYear: movie.release_year,
        description: movie.description,
        genre: movie.genre,
        posterPath: movie.posterpath,
        backdropPath: movie.backdroppath,
        originalTitle: movie.title,
        match_percent: Math.max(
          0,
          Math.min(100, Math.round(movie.match_percent)),
        ),
      }));

      // const yourGenreFormat = res.data.yourGenre.map((movie) => ({
      //   id: movie.id,
      //   title: movie.title,
      //   releaseYear: movie.release_year,
      //   description: movie.description,
      //   genre: movie.genre,
      //   posterPath: movie.posterpath,
      //   backdropPath: movie.backdroppath,
      //   originalTitle: movie.title,
      // }));
      setLoading(false);
      const searching = true;
      localStorage.setItem("search-mode", JSON.stringify(searching));

      setVectorSearchResults(formattedMovies);

      const updatedResults = [...formattedMovies];
      localStorage.setItem("search-results", JSON.stringify(updatedResults));
      // setYourGenreSearchResults(yourGenreFormat);
    } catch (err) {
      console.error("Vector search failed:", err);
    }
  };

  const renderVectorSearchResults = () => {
    return (
      <>
        <ul className="grid-container watch-layout">
          {vectorSearchResults.map((movie) => (
            <Link
              key={movie.id}
              to={`/trending/${encodeURIComponent(movie.title)}/${movie.id}`}
              style={{ textDecoration: "none", listStyle: "none" }}
              onClick={() => addToWatchHistory(movie.id, movie.movieEmbedding)}
            >
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
              >
                <div className="sm-p">
                  <div className="sm-div">
                    <h4 className="movie-title">{movie.originalTitle}</h4>
                  </div>

                  <div className="sm-div">
                    <h4>{movie.releaseYear}</h4>
                  </div>

                  <div className="sm-div">
                    <h4 className={movie.match_percent > 40 ? "green" : "red"}>
                      {movie.match_percent}% match
                    </h4>
                  </div>
                </div>
              </li>
            </Link>
          ))}
        </ul>
        {/* <h1>Your Genre Results... </h1>
        <ul className="grid-container">
          {yourGenreSearchResults.map((movie) => (
            <Link
              key={movie.id}
              to={`/trending/${encodeURIComponent(movie.title)}/${movie.id}`}
              style={{ textDecoration: "none", listStyle: "none" }}
              onClick={() => addToWatchHistory(movie.id, movie.movieEmbedding)}
            >
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
              >
                <div className="sm-p">
                  <div className="sm-div">
                    <h4 className="movie-title">{movie.originalTitle}</h4>
                  </div>

                  <div className="sm-div">
                    <h4>{movie.releaseYear}</h4>
                  </div>
                </div>
              </li>
            </Link>
          ))}
        </ul> */}
      </>
    );
  };
  return (
    <div>
      <hr className="divider" />

      <div className="search-wrapper">
        <div className="search-container">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            placeholder="Search movies, series, anime..."
            className="search-input"
            onBlur={() => {
              setTimeout(() => {
                setSMode(false);
              }, 300);
            }}
            onFocus={() => setSMode(true)}
          />
          <button onClick={vectorSearch} className="search-btn">
            Search
          </button>
        </div>
      </div>
      <div className="s">
        <div>
          {sMode && (
            <div className="suggestions-container">
              {suggestions.map((s, id) => (
                <div
                  className="each-suggestion"
                  onClick={() => setInput(s.suggestion)}
                >
                  <p key={id}>{s.suggestion}</p>
                  <MdArrowOutward />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <hr className="divider" />
      {loading ? (
        <ul className="grid-container watch-layout">
          {[...Array(8)].map((_, index) => (
            <li key={index} className="loading-card" />
          ))}
        </ul>
      ) : (
        <div className="main-movie-content">{renderVectorSearchResults()}</div>
      )}
    </div>
  );
};

export default SearchEngine;
