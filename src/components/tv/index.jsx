import { Component } from "react";
import { Link } from "react-router-dom";
import { FaSearchengin } from "react-icons/fa";
import Loader from "react-loader-spinner";
import "./index.css";

import Header from "../header/index";
import axios from "axios";

class Anime extends Component {
  state = {
    allTrendingMovies: [],
    fullAnimeSeries: [],
    animeSearchInput: "",
    currentPage: 1,
    toggleSearchBar: false,
    geminiSearch: "",
    similarMovies: [],
    geminiMode: false,
    geminiApi: import.meta.env.VITE_GEMINI_API_KEY,
  };

  componentDidMount() {
    this.getAllTrendingMovies();
  }

  extractArrayFromText = (text) => {
    const match = text.match(/\[([\s\S]*?)\]/);
    if (match) {
      try {
        const parsedArray = JSON.parse(match[0]);
        this.setState({ similarMovies: parsedArray });
      } catch (err) {
        console.error("JSON parse failed", err);
      }
    }
  };

  // get simlar movies

  geminiResponse = async () => {
    const { geminiSearch, geminiApi } = this.state;
    try {
      // maintain conversation history properly
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApi}`,
        method: "post",
        data: {
          contents: [
            {
              parts: [
                {
                  text: `List 10 movies similar to "${geminiSearch}" in a JSON array of objects with keys: originalTitle, overview, id, posterPath, releaseDate, averageVotes, backdropPath, title, Poster.`,
                },
              ],
            },
          ],
        },
      });
      const ans2 = response.data.candidates[0].content.parts[0].text;
      console.log(ans2);
      this.extractArrayFromText(ans2);
    } catch (err) {
      console.error("Error fetching Gemini response:", err);
    }
  };

  getAnimeSeriesData = async () => {
    const { animeSearchInput, currentPage } = this.state;

    const animeSeriesApi = `https://omdbapi.com/?s=${animeSearchInput}&apikey=14dc6453&page=${currentPage}`;
    const options = {
      method: "GET",
    };
    try {
      const response = await fetch(animeSeriesApi, options);
      const jsonData = await response.json();
      const formattedSeriesData = jsonData.Search.map((eachSeries) => ({
        title: eachSeries.Title,
        year: eachSeries.Year,
        imdbID: eachSeries.imdbID,
        poster: eachSeries.Poster,
      }));
      this.setState({ fullAnimeSeries: formattedSeriesData });
    } catch {
      console.log("error");
    }
  };

  renderAnimeSeriesData = () => {
    const { fullAnimeSeries } = this.state;

    return (
      <ul className="grid-container">
        {fullAnimeSeries.map((movie) => (
          <Link
            key={movie.imdbID}
            to={`/trending/${movie.title}/${movie.imdbID}`}
            style={{ textDecoration: "none", listStyle: "none" }}
          >
            <li
              className="indivisual-movie-container"
              style={{
                marginBottom: "20px",
                listStyle: "none",
                backgroundImage: `url(${movie.poster})`,
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
              <div className="sm-p">
                <div className="sm-div">
                  <h4 className="movie-title">{movie.title}</h4>
                </div>

                <div className="sm-div">
                  <h4>{movie.imdbID}</h4>
                </div>
                <div className="sm-div">
                  <h4>{movie.year}</h4>
                </div>
              </div>
            </li>
          </Link>
        ))}
      </ul>
    );
  };

  getAllTrendingMovies = async () => {
    const { currentPage } = this.state;
    try {
      const url = `https://thingproxy-760k.onrender.com/fetch/https://api.themoviedb.org/3/discover/movie?api_key=04c35731a5ee918f014970082a0088b1&page=${currentPage}&with_genres=10770`;
      const options = {
        method: "GET",
      };
      const response = await fetch(url, options);
      const jsonData = await response.json();
      const formatttedAllTrendingMovies = jsonData.results.map((eachMovie) => ({
        originalTitle: eachMovie.original_title,
        overview: eachMovie.overview,
        id: eachMovie.id,
        posterPath: eachMovie.poster_path,
        releaseDate: eachMovie.release_date,
        averageVotes: eachMovie.vote_average,
        backdropPath: eachMovie.backdrop_path,
        title: eachMovie.title,
      }));
      this.setState({ allTrendingMovies: formatttedAllTrendingMovies });
    } catch {
      this.setState({ allTrendingMovies: ["error"] });
    }
  };

  renderAllTrendingMovies = () => {
    const { allTrendingMovies } = this.state;

    if (allTrendingMovies.length === 0) {
      return (
        <div className="loading-container">
          <div className="loader-container" data-testid="loader">
            <Loader
              type="BallTriangle"
              color="black"
              height="100"
              width="100"
            />
          </div>
        </div>
      );
    }

    if (allTrendingMovies[0] === "error") {
      return <p>Error fetching movies</p>;
    }

    return (
      <ul className="grid-container">
        {allTrendingMovies.map((movie) => (
          <Link
            key={movie.id}
            to={`/trending/${movie.title}/${movie.id}`}
            style={{ textDecoration: "none", listStyle: "none" }}
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
              <div className="sm-p">
                <div className="sm-div">
                  <h4 className="movie-title">{movie.originalTitle}</h4>
                </div>

                <div className="sm-div">
                  <h4>{movie.averageVotes.toFixed(1)}</h4>
                </div>
                <div className="sm-div">
                  <h4>{movie.releaseDate}</h4>
                </div>
              </div>
            </li>
          </Link>
        ))}
      </ul>
    );
  };

  nextPage = () => {
    this.setState(
      (prev) => ({ currentPage: prev.currentPage + 1 }),
      this.getAnimeSeriesData
    );
  };

  prevPage = () => {
    const { currentPage } = this.state;
    if (currentPage > 1) {
      this.setState(
        (prev) => ({ currentPage: prev.currentPage - 1 }),
        this.getAnimeSeriesData
      );
    }
  };

  updateInput = (event) => {
    this.setState(
      { animeSearchInput: event.target.value },
      this.getAnimeSeriesData
    );
  };

  updateGeminiSearch = (event) => {
    this.setState({ geminiSearch: event.target.value });
  };

  toggleSearchbar = () => {
    this.setState((prev) => ({ toggleSearchBar: !prev.toggleSearchBar }));
  };

  switchGeminiMode = () => {
    this.setState((prev) => ({ geminiMode: !prev.geminiMode }));
  };

  render() {
    const {
      currentPage,
      animeSearchInput,
      toggleSearchBar,
      geminiSearch,
      similarMovies,
      geminiMode,
    } = this.state;
    return (
      <>
        <div>
          <div>
            <Header />
          </div>

          <button onClick={this.switchGeminiMode}>Gemini mode</button>

          {!geminiMode ? (
            <div className="pages-section">
              <div className="searchBox-container">
                <FaSearchengin
                  className="searchIcon"
                  style={{ fontSize: "20px" }}
                />
                <input
                  type="text"
                  placeholder="Search any series of your choice..."
                  value={animeSearchInput}
                  onChange={this.updateInput}
                  className="searchBox"
                />
              </div>
            </div>
          ) : (
            <div className="pages-section">
              <div className="searchBox-container">
                <FaSearchengin
                  className="searchIcon"
                  style={{ fontSize: "20px" }}
                />
                <input
                  type="text"
                  placeholder="Search any series of your choice..."
                  value={geminiSearch}
                  onChange={this.updateGeminiSearch}
                  className="searchBox"
                />
                <button onClick={this.geminiResponse}>find</button>
              </div>
            </div>
          )}

          <div
            className="pages-section-sm"
            style={{ textAlign: "center", margin: "20px" }}
          >
            {toggleSearchBar && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "20px",
                }}
              >
                <div className="searchBox-container">
                  <FaSearchengin
                    className="searchIcon"
                    style={{ fontSize: "20px" }}
                  />
                  <input
                    type="text"
                    placeHolder="Search series..."
                    value={animeSearchInput}
                    onChange={this.updateInput}
                    className="searchBox"
                  />
                  <button type="button" onClick={this.geminiResponse}>
                    find
                  </button>
                </div>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={this.toggleSearchbar}
                className="toggle-button"
                type="button"
              >
                Search
              </button>
            </div>
          </div>

          {animeSearchInput.trim() || geminiMode !== "" ? (
            <div>{this.renderAnimeSeriesData()}</div>
          ) : (
            <div>{this.renderAllTrendingMovies()}</div>
          )}

          {geminiMode ? (
            <div className="search-suggestion-container">
              <ul className="suggested-movies-container">
                {similarMovies.map((movie) => (
                  <Link
                    key={movie.id}
                    to={`/trending/${movie.title}/${movie.id}`}
                    style={{ textDecoration: "none", listStyle: "none" }}
                  >
                    <li
                      className="indivisual-movie-container"
                      style={{
                        marginBottom: "20px",
                        listStyle: "none",
                        backgroundImage: `url(
                          'https://m.media-amazon.com/images/M/MV5BMmFiZGZjMmEtMTA0Ni00MzA2LTljMTYtZGI2MGJmZWYzZTQ2XkEyXkFqcGc@._V1_SX300.jpg',
                        )`,
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
                          <h4>{movie.averageVotes.toFixed(1)}</h4>
                        </div>
                        <div className="sm-div">
                          <h4>{movie.releaseDate}</h4>
                        </div>
                      </div>
                    </li>
                  </Link>
                ))}
              </ul>
            </div>
          ) : (
            this.renderAllTrendingMovies()
          )}

          <div className="pages-section3">
            <button
              className="cool-button"
              type="button"
              onClick={this.prevPage}
            >
              Prev
            </button>
            <div className="page-num">
              <h1 className="currentPage-num">{currentPage}</h1>
            </div>
            <button
              className="cool-button"
              type="button"
              onClick={this.nextPage}
            >
              Next
            </button>
          </div>
        </div>
      </>
    );
  }
}

export default Anime;
