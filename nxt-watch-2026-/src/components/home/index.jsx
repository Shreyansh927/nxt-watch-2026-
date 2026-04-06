import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlayCircle, FaArrowCircleRight } from "react-icons/fa";
import { Loader } from "react-loader-spinner";
import axios from "axios";
import Slider from "react-slick";
import { HiDotsVertical } from "react-icons/hi";
import fetchWatchLaterFolders from "../../../fetch-all-watch-later-folders";
import { MdPlaylistAddCircle } from "react-icons/md";

import Header from "../header/index";
import { FaFireAlt } from "react-icons/fa";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./index.css";

const Home = () => {
  const [carouselMoviesArray, setCarouselMoviesArray] = useState([]);
  const [carouselDocumentaryArray, setCarouselDocumentaryArray] = useState([]);
  const [carouselAnimeArray, setCarouselAnimeArray] = useState([]);
  const [carouselTvArray, setCarouselTvArray] = useState([]);
  const [randomPage, setRandomPage] = useState(10);
  const [activeMenu, setActiveMenu] = useState(null);
  const [latestWatchLaters, setLatestWatchLaters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [userGenre, setUserGenre] = useState(
    JSON.parse(localStorage.getItem("genre-list")) || [],
  );
  const [sug, setSug] = useState([]);
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );
  const geminiApi = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    const page = Math.floor(Math.random() * 100);
    setRandomPage(page);
  }, []);

  useEffect(() => {
    localStorage.setItem("genre-list", JSON.stringify(userGenre));
  }, [userGenre]);

  const extractArrayFromText = (text) => {
    const match = text.match(/\[([\s\S]*?)\]/);
    if (match) {
      const parsedSuggestedMoviesList = JSON.parse(match[0]);
      console.log(parsedSuggestedMoviesList);
      setSug(parsedSuggestedMoviesList);
    }
  };

  const geminiResponse = async () => {
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
                  text: `List 10 movies similar to "${JSON.stringify(
                    userGenre,
                  )}" in a JSON array of objects with keys: originalTitle, overview, id, posterPath, releaseDate, averageVotes, backdropPath, title, Poster.`,
                },
              ],
            },
          ],
        },
      });
      const ans2 = response.data.candidates[0].content.parts[0].text;
      console.log(ans2);
      extractArrayFromText(ans2);
    } catch (err) {
      console.error("Error fetching Gemini response:", err);
    }
  };
  const fetchData = async (apiUrl, setStateFunction) => {
    try {
      const response = await axios.get(apiUrl);
      const formattedMovies = response.data.movies.map((movie) => ({
        id: movie.id,
        title: movie.title,
        releaseYear: movie.release_year,
        description: movie.description,
        genre: movie.genre,
        posterpath: movie.posterpath,
        backdroppath: movie.backdroppath,
        originalTitle: movie.title,
      }));
      setStateFunction(formattedMovies);
      console.log(response.data.movies);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const getTrendingMoviesData = () => {
    const apiUrl = `http://localhost:5000/api/discover-movies?page=${randomPage}`;
    fetchData(apiUrl, setCarouselMoviesArray);
  };

  const getTrendingDocumentaryData = () => {
    const apiUrl = `http://localhost:5000/api/discover-documetries`;
    fetchData(apiUrl, setCarouselDocumentaryArray);
  };

  const getTrendingAnimeData = () => {
    const apiUrl = `http://localhost:5000/api/discover-animes?page=${randomPage}`;
    fetchData(apiUrl, setCarouselAnimeArray);
  };

  const getTrendingTvData = () => {
    const apiUrl = `http://localhost:5000/api/discover-tv?page=${randomPage}`;
    fetchData(apiUrl, setCarouselTvArray);
  };

  useEffect(() => {
    getTrendingMoviesData();
    getTrendingAnimeData();
    getTrendingDocumentaryData();
    getTrendingTvData();
    getRecommendedMovies();

    if (userGenre.length > 0) {
      geminiResponse();
    }
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [sug]);

  const getRecommendedMovies = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/recommendations", {
        withCredentials: true,
      });
      const formatted = res.data.results.map((movie) => ({
        id: movie.id,
        title: movie.title,
        releaseYear: movie.release_year,
        description: movie.description || movie.overview,
        genre: movie.genre,
        posterpath: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
          : movie.posterpath,
        backdroppath: movie.backdrop_path,
        originalTitle: movie.title,
      }));
      setRecommendedMovies(formatted);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching recommended movies:", err);
    }
  };

  const addToUserGenre = (movie) => {
    const matched = userGenre.find((each) => each.title === movie.title);

    if (!matched) {
      setUserGenre((prev) => {
        const updatedList = [...prev, movie];
        localStorage.setItem("genre-list", JSON.stringify(updatedList));
        return updatedList;
      });
    }
  };

  const sliderSettings = {
    dots: true,

    speed: 800,
    slidesToShow: 6,
    slidesToScroll: 2,
    infinite: true,
    autoplaySpeed: 3500,
    pauseOnHover: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3, slidesToScroll: 2 },
      },
      {
        breakpoint: 900,
        settings: { slidesToShow: 2, slidesToScroll: 2 },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 2, slidesToScroll: 1 },
      },
      {
        breakpoint: 400,
        settings: { slidesToShow: 1, slidesToScroll: 1 },
      },
    ],
  };

  const renderCarousel = (array) => (
    <Slider {...sliderSettings} className="slider-wrapper">
      {array.map((movie) => (
        <Link
          to={`/trending/${encodeURIComponent(movie.title)}/${movie.id}`}
          style={{ textDecoration: "none" }}
          key={movie.id}
        >
          <div
            className="poster-card"
            style={{ margin: "5px" }}
            role="button"
            tabIndex={0}
            onClick={() => addToUserGenre(movie)}
          >
            <img
              src={
                movie.posterpath
                  ? movie.posterpath
                  : "https://via.placeholder.com/500x750?text=No+Image"
              }
              alt={movie.title}
              className="poster-img"
              loading="lazy"
            />
            <div className="poster-card-content">
              <p style={{ marginBottom: "20px", fontSize: "19px" }}>
                {movie.title}
              </p>
              <button
                style={{ cursor: "pointer" }}
                type="button"
                className="colorful-reddish-button"
              >
                <FaPlayCircle
                  style={{
                    marginRight: "10px",
                    fontSize: "13px",
                    transform: "scale(1.2)",
                  }}
                />
                Watch Now
              </button>
            </div>
          </div>
        </Link>
      ))}
    </Slider>
  );

  // const yourGenreCarousel = () => (
  //   <Slider {...sliderSettings} className="slider-wrapper">
  //     {sug.map((movie) => (
  //       <Link
  //         to={`/trending/${encodeURIComponent(movie.title)}/${movie.id}`}
  //         style={{ textDecoration: "none" }}
  //         key={movie.id}
  //       >
  //         <div
  //           className="poster-card"
  //           role="button"
  //           tabIndex={0}
  //           onClick={() => addToUserGenre(movie)}
  //         >
  //           {/* <img
  //             src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
  //             alt={movie.title}
  //             className="poster-img"
  //           /> */}
  //           <div className="poster-card-content">
  //             <p
  //               className="poster-title"
  //               style={{ marginBottom: "20px", fontSize: "19px" }}
  //             >
  //               {movie.title}
  //             </p>
  //             <button
  //               style={{ cursor: "pointer" }}
  //               type="button"
  //               className="colorful-reddish-button"
  //             >
  //               <FaPlayCircle
  //                 style={{
  //                   marginRight: "10px",
  //                   fontSize: "13px",
  //                   transform: "scale(1.2)",
  //                 }}
  //               />
  //               Watch Now
  //             </button>
  //           </div>
  //         </div>
  //       </Link>
  //     ))}
  //   </Slider>
  // );
  const heroMovie = recommendedMovies[0];
  return (
    <>
      {loading ? (
        <div className="home-loading-grid">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="skeleton-card" />
          ))}
        </div>
      ) : (
        <div className="home-page">
          <section className="home-hero-section">
            <div className="hero-copy">
              <span className="eyebrow-badge">Featured for you</span>
              <h1>Watch smarter. Discover better. Feel the cinema.</h1>
              <p>
                A premium home for every film fan — personalized
                recommendations, curated collections, and intelligent
                suggestions that keep your watchlist fresh.
              </p>
              <div className="hero-actions">
                <Link to="/trending" className="hero-button primary">
                  Explore Trending
                </Link>
                <Link to="/search" className="hero-button secondary">
                  Search New Releases
                </Link>
              </div>
              <div className="hero-stat-grid">
                <div className="hero-stat">
                  <span>{recommendedMovies.length}</span>
                  <p>Premium Picks</p>
                </div>
                <div className="hero-stat">
                  <span>{userGenre.length || 8}</span>
                  <p>Your Genres</p>
                </div>
                <div className="hero-stat">
                  <span>4</span>
                  <p>Curated Collections</p>
                </div>
              </div>
            </div>

            <div className="hero-feature-panel">
              <div
                className="hero-feature-image"
                style={{
                  backgroundImage: `url(${recommendedMovies[2]?.posterpath})`,
                }}
              >
                <div className="hero-feature-copy">
                  <span>Editor's Choice</span>
                  <h2>{recommendedMovies[2]?.title || "Current Premiere"}</h2>
                  <p>
                    {recommendedMovies[2]?.description ||
                      "Experience the top-rated release handpicked for you."}
                  </p>
                  <div className="hero-feature-meta">
                    <span>{recommendedMovies[2]?.release_year || "2026"}</span>
                    <span>{recommendedMovies[2]?.genre || "Drama"}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="home-intro-cards">
            <article className="info-card accent">
              <h3>AI-powered suggestions</h3>
              <p>
                Personalized movie ideas based on your favorite genres and
                viewing habits.
              </p>
            </article>
            <article className="info-card">
              <h3>High fidelity browsing</h3>
              <p>
                Fast, polished discovery with premium visuals and smooth
                carousel interactions.
              </p>
            </article>
            <article className="info-card">
              <h3>One-click watchlist</h3>
              <p>
                Add movies to your list instantly and keep the best picks ready
                for later.
              </p>
            </article>
          </section>

          <section className="home-section recommended-section">
            <div className="section-heading">
              <div>
                <span className="section-label accent">Recommended</span>
                <h2>Personalized for you</h2>
              </div>
              <Link to="/search" className="view-more-link">
                View all
                <FaArrowCircleRight />
              </Link>
            </div>
            {renderCarousel(recommendedMovies)}
          </section>

          <section className="home-section">
            <div className="section-heading">
              <div>
                <span className="section-label">Trending</span>
                <h2>Movies you can't miss</h2>
              </div>
              <Link to="/trending" className="view-more-link">
                View all
                <FaArrowCircleRight />
              </Link>
            </div>
            {renderCarousel(carouselMoviesArray)}
          </section>

          <section className="home-section">
            <div className="section-heading">
              <div>
                <span className="section-label">Documentary</span>
                <h2>True stories in cinematic style</h2>
              </div>
              <Link to="/documentary" className="view-more-link">
                View all
                <FaArrowCircleRight />
              </Link>
            </div>
            {renderCarousel(carouselDocumentaryArray)}
          </section>

          <section className="home-section">
            <div className="section-heading">
              <div>
                <span className="section-label">Anime</span>
                <h2>Animated worlds you’ll love</h2>
              </div>
              <Link to="/anime" className="view-more-link">
                View all
                <FaArrowCircleRight />
              </Link>
            </div>
            {renderCarousel(carouselAnimeArray)}
          </section>

          <section className="home-section no-bottom-spacing">
            <div className="section-heading">
              <div>
                <span className="section-label">TV</span>
                <h2>Top shows and series picks</h2>
              </div>
              <Link to="/tv" className="view-more-link">
                View all
                <FaArrowCircleRight />
              </Link>
            </div>
            {renderCarousel(carouselTvArray)}
          </section>
        </div>
      )}
    </>
  );
};

export default Home;
