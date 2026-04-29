import axios from "axios";
import React, { useState } from "react";
import Header from "../header";
import { Link } from "react-router-dom";
import "./search-engine.css";
import addToWatchHistory from "../../../add-to-watch-history";
import { useEffect } from "react";

import { MdArrowOutward } from "react-icons/md";
import { MdOutlineSearch } from "react-icons/md";
import Loader from "react-loader-spinner";
import AiAssistant from "../natural-language-command-system-ai";

const SearchEngine = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [vectorSearchResults, setVectorSearchResults] = useState(
    JSON.parse(localStorage.getItem("search-results")) || [],
  );
  const [similarResults, setSimilarResults] = useState(
    JSON.parse(localStorage.getItem("similar-search-results")) || [],
  );
  const [trendingResults, setTrendingResults] = useState(
    JSON.parse(localStorage.getItem("trending-search-results")) || [],
  );
  const [suggestions, setSuggestions] = useState([]);
  const [sMode, setSMode] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.trim() !== "") {
        activeSuggestions(input);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [input]);

  const activeSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(`https://en.wikipedia.org/w/api.php`, {
        params: {
          action: "opensearch",
          search: query,
          limit: 5,
          namespace: 0,
          format: "json",
          origin: "*",
        },
      });

      console.log("RAW RESPONSE:", res.data);

      const suggestions = res.data[1] || [];

      const formattedResponse = suggestions.map((s) => ({
        suggestion: s,
      }));

      setSuggestions(formattedResponse);
    } catch (err) {
      console.error("Autocomplete Error:", err.message);
      setSuggestions([]);
    }
  };

  const vectorSearch = async () => {
    setVectorSearchResults([]);
    setSearching(true);
    setLoading(true);
    // setYourGenreSearchResults([]);
    if (!input.trim()) {
      return;
    }
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/vector-search`,
        {
          params: {
            query: input,
          },
          withCredentials: true,
        },
      );

      const formattedMovies = res.data.results.map((movie) => ({
        id: movie.id,
        title: movie.title,
        releaseYear: movie.release_year,
        description: movie.description,
        genre: movie.genre,
        posterPath: movie.posterpath,
        backdropPath: movie.backdroppath,
        originalTitle: movie.title,
        movieEmbedding: movie.vector_embedding,
        match_percent: Math.max(
          0,
          Math.min(100, Math.round(movie.match_percent)),
        ),
      }));
      const formattedSimilarMovies = res.data.similar_results.map((movie) => ({
        id: movie.id,
        title: movie.title,
        releaseYear: movie.release_year,
        description: movie.description,
        genre: movie.genre,
        posterPath: movie.posterpath,
        backdropPath: movie.backdroppath,
        originalTitle: movie.title,
        movieEmbedding: movie.vector_embedding,
        match_percent: Math.max(
          0,
          Math.min(100, Math.round(movie.match_percent)),
        ),
      }));
      const formattedTrendingMovies = res.data.trending_results.map(
        (movie) => ({
          id: movie.id,
          title: movie.title,
          releaseYear: movie.release_year,
          description: movie.description,
          genre: movie.genre,
          posterPath: movie.posterpath,
          backdropPath: movie.backdroppath,
          originalTitle: movie.title,
          movieEmbedding: movie.vector_embedding,
          match_percent: Math.max(
            0,
            Math.min(100, Math.round(movie.match_percent)),
          ),
        }),
      );

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
      setSearching(false);
      const searching = true;
      localStorage.setItem("search-mode", JSON.stringify(searching));

      setVectorSearchResults(formattedMovies);
      setSimilarResults(formattedSimilarMovies);
      setTrendingResults(formattedTrendingMovies);

      const updatedResults = [...formattedMovies];
      const updatedSimilarResults = [...formattedSimilarMovies];
      const updatedTrendingResults = [...formattedTrendingMovies];
      localStorage.setItem("search-results", JSON.stringify(updatedResults));
      localStorage.setItem(
        "similar-search-results",
        JSON.stringify(updatedSimilarResults),
      );
      localStorage.setItem(
        "trending-search-results",
        JSON.stringify(updatedTrendingResults),
      );
      // setYourGenreSearchResults(yourGenreFormat);
    } catch (err) {
      console.error("Vector search failed:", err);
    }
  };

  const renderVectorSearchResults = () => {
    if (vectorSearchResults.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">
            <MdOutlineSearch />
          </div>
          <h2 className="empty-title">No results found</h2>
          <p className="empty-description">
            Try searching with different keywords
          </p>
        </div>
      );
    }

    return (
      <>
        <AiAssistant />
        <div className="results-header">
          <h2 className="results-title">Search Results</h2>
          <p className="results-count">
            {vectorSearchResults.length} results found
          </p>
        </div>

        <ul className="search-grid-container">
          {vectorSearchResults.map((movie) => (
            <li
              key={movie.id}
              className="search-movie-card"
              style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/w500${movie.backdropPath})`,
              }}
            >
              <Link
                to={`/trending/${encodeURIComponent(movie.title)}/${movie.id}`}
                className="search-movie-link"
                onClick={() =>
                  addToWatchHistory(movie.id, movie.movieEmbedding)
                }
              >
                <div className="search-movie-overlay">
                  <div className="search-movie-info">
                    <h3 className="search-movie-title">
                      {movie.originalTitle}
                    </h3>
                    <div className="search-movie-meta">
                      <span className="search-release-year">
                        {movie.releaseYear}
                      </span>
                      <span
                        className={`search-match-percent ${movie.match_percent > 40 ? "match-high" : "match-low"}`}
                      >
                        {movie.match_percent}% match
                      </span>
                    </div>
                    {movie.genre && (
                      <p className="search-movie-genre">{movie.genre}</p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="results-header" style={{ marginTop: "60px" }}>
          <h2 className="results-title">Personalized Search Results</h2>
          <p className="results-count">
            {vectorSearchResults.length} results found
          </p>
        </div>
        <ul className="search-grid-container">
          {similarResults.map((movie) => (
            <li
              key={movie.id}
              className="search-movie-card"
              style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/w500${movie.backdropPath})`,
              }}
            >
              <Link
                to={`/trending/${encodeURIComponent(movie.title)}/${movie.id}`}
                className="search-movie-link"
                onClick={() =>
                  addToWatchHistory(movie.id, movie.movieEmbedding)
                }
              >
                <div className="search-movie-overlay">
                  <div className="search-movie-info">
                    <h3 className="search-movie-title">
                      {movie.originalTitle}
                    </h3>
                    <div className="search-movie-meta">
                      <span className="search-release-year">
                        {movie.releaseYear}
                      </span>
                      <span
                        className={`search-match-percent ${movie.match_percent > 40 ? "match-high" : "match-low"}`}
                      >
                        {movie.match_percent}% match
                      </span>
                    </div>
                    {movie.genre && (
                      <p className="search-movie-genre">{movie.genre}</p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="results-header" style={{ marginTop: "60px" }}>
          <h2 className="results-title">Trending Search Results</h2>
          <p className="results-count">
            {vectorSearchResults.length} results found
          </p>
        </div>

        <ul className="search-grid-container">
          {trendingResults.map((movie) => (
            <li
              key={movie.id}
              className="search-movie-card"
              style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/w500${movie.backdropPath})`,
              }}
            >
              <Link
                to={`/trending/${encodeURIComponent(movie.title)}/${movie.id}`}
                className="search-movie-link"
                onClick={() =>
                  addToWatchHistory(movie.id, movie.movieEmbedding)
                }
              >
                <div className="search-movie-overlay">
                  <div className="search-movie-info">
                    <h3 className="search-movie-title">
                      {movie.originalTitle}
                    </h3>
                    <div className="search-movie-meta">
                      <span className="search-release-year">
                        {movie.releaseYear}
                      </span>
                      <span
                        className={`search-match-percent ${movie.match_percent > 40 ? "match-high" : "match-low"}`}
                      >
                        {movie.match_percent}% match
                      </span>
                    </div>
                    {movie.genre && (
                      <p className="search-movie-genre">{movie.genre}</p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </>
    );
  };
  return (
    <div className="search-engine-page">
      {/* Hero Section */}
      <section className="search-hero">
        <div className="hero-content">
          <h1 className="hero-title">Discover Your Next Favorite</h1>
          <p className="hero-subtitle">
            Search through thousands of movies, series, and anime
          </p>

          {/* Search Container */}
          <div className="search-wrapper">
            <div className="search-container">
              <div className="search-icon-wrapper">
                <MdOutlineSearch className="search-icon" />
              </div>
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
              {searching ? (
                <button
                  className="search-btn"
                  style={{ cursor: "not-allowed" }}
                  disabled
                >
                  <Loader
                    type="ThreeDots"
                    color="white"
                    height="20"
                    width="40"
                  />
                </button>
              ) : (
                input && (
                  <button onClick={vectorSearch} className="search-btn">
                    Search
                  </button>
                )
              )}
            </div>

            {/* Suggestions Dropdown */}
            {sMode && suggestions.length > 0 && (
              <div className="suggestions-container">
                {suggestions.map((s, id) => (
                  <div
                    key={id}
                    className="each-suggestion"
                    onClick={() => {
                      setInput(s.suggestion);
                      vectorSearch();
                    }}
                  >
                    <div className="suggestion-text">
                      <MdOutlineSearch className="suggestion-icon" />
                      <span>{s.suggestion}</span>
                    </div>
                    <MdArrowOutward className="suggestion-arrow" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="search-results-section">
        {loading ? (
          <div className="loading-results">
            <div className="loading-grid">
              {[...Array(12)].map((_, index) => (
                <li key={index} className="loading-card" />
              ))}
            </div>
          </div>
        ) : vectorSearchResults.length > 0 ? (
          <div className="main-movie-content">
            {renderVectorSearchResults()}
          </div>
        ) : (
          input &&
          !loading && (
            <div className="main-movie-content">
              {renderVectorSearchResults()}
            </div>
          )
        )}
      </section>
    </div>
  );
};

export default SearchEngine;
