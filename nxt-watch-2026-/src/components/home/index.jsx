import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlayCircle, FaArrowCircleRight } from "react-icons/fa";
import Loader from "react-loader-spinner"; // ❌ wrong (for v5+)

import Slider from "react-slick";
import axios from "axios";

import Header from "../header/index";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./index.css";

const Home = () => {
  const [carouselMoviesArray, setCarouselMoviesArray] = useState([]);
  const [carouselDocumentaryArray, setCarouselDocumentaryArray] = useState([]);
  const [carouselAnimeArray, setCarouselAnimeArray] = useState([]);
  const [carouselTvArray, setCarouselTvArray] = useState([]);
  const [randomPage, setRandomPage] = useState(10);
  const [userGenre, setUserGenre] = useState(
    JSON.parse(localStorage.getItem("genre-list")) || [],
  );
  const [sug, setSug] = useState([]);
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
      alert("Error fetching your genre movies , refresh the page...");
    }
  };
  const fetchData = async (url, setData) => {
    try {
      const response = await fetch(url);
      const jsonData = await response.json();
      const formattedData = jsonData.movies.map((each) => ({
        id: each.id,
        title: each.title,
        overview: each.overview,
        originalName: each.title,
      }));
      setData(formattedData);
    } catch (error) {
      console.log("Error fetching data", error);
    }
  };

  const getTrendingMoviesData = () => {
    const apiUrl = `http://localhost:5000/api/movies`;
    fetchData(apiUrl, setCarouselMoviesArray);
  };

  // const getTrendingDocumentaryData = () => {
  //   const apiUrl = `https://thingproxy-760k.onrender.com/fetch/https://api.themoviedb.org/3/discover/movie?api_key=04c35731a5ee918f014970082a0088b1&page=${randomPage}&with_genres=99`;
  //   fetchData(apiUrl, setCarouselDocumentaryArray);
  // };

  // const getTrendingAnimeData = () => {
  //   const apiUrl = `https://thingproxy-760k.onrender.com/fetch/https://api.themoviedb.org/3/discover/movie?api_key=04c35731a5ee918f014970082a0088b1&page=${randomPage}&with_genres=16`;
  //   fetchData(apiUrl, setCarouselAnimeArray);
  // };

  // const getTrendingTvData = () => {
  //   const apiUrl = `https://thingproxy-760k.onrender.com/fetch/https://api.themoviedb.org/3/discover/movie?api_key=04c35731a5ee918f014970082a0088b1&page=${randomPage}&with_genres=10770`;
  //   fetchData(apiUrl, setCarouselTvArray);
  // };

  useEffect(() => {
    getTrendingMoviesData();
    // getTrendingAnimeData();
    // getTrendingDocumentaryData();
    // getTrendingTvData();

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
            role="button"
            tabIndex={0}
            onClick={() => addToUserGenre(movie)}
          >
            {/* <img
              src={`https://image.tmdb.org/t/p/w500/${movie.posterPath}`}
              alt={movie.title}
              className="poster-img"
            /> */}
            <div className="poster-card-content">
              <p
                className="poster-title"
                style={{ marginBottom: "20px", fontSize: "19px" }}
              >
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

  const yourGenreCarousel = () => (
    <Slider {...sliderSettings} className="slider-wrapper">
      {sug.map((movie) => (
        <Link
          to={`/trending/${movie.title}/${movie.id}`}
          style={{ textDecoration: "none" }}
          key={movie.id}
        >
          <div
            className="poster-card"
            role="button"
            tabIndex={0}
            onClick={() => addToUserGenre(movie)}
          >
            {/* <img
              src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
              alt={movie.title}
              className="poster-img"
            /> */}
            <div className="poster-card-content">
              <p
                className="poster-title"
                style={{ marginBottom: "20px", fontSize: "19px" }}
              >
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

  return (
    <>
      <Header />
      <div className="home-page">
        {sug.length === 0 ? (
          <div className="loader-container">
            <Loader
              height="80"
              width="80"
              color="#FF3D00"
              ariaLabel="loading"
              type="ThreeDots"
            />
          </div>
        ) : (
          <>
            <h1>Your Genre</h1>

            <div>{yourGenreCarousel()}</div>
          </>
        )}
        <div className="carousel-section" style={{ marginBottom: "50px" }}>
          <div className="trending-text">
            <h1 className="trending-content-text">Trending Movies</h1>
            <Link to="/trending" style={{ textDecoration: "none" }}>
              <h1 type="button">
                <FaArrowCircleRight className="view-all-button" />
              </h1>
            </Link>
          </div>
          {renderCarousel(carouselMoviesArray)}
        </div>

        <div className="carousel-section" style={{ marginBottom: "50px" }}>
          <div className="trending-text">
            <h1 className="trending-content-text">Trending Documentries</h1>
            <Link to="/documentary" style={{ textDecoration: "none" }}>
              <h1 type="button">
                <FaArrowCircleRight className="view-all-button" />
              </h1>
            </Link>
          </div>
          {renderCarousel(carouselDocumentaryArray)}
        </div>

        <div className="carousel-section" style={{ marginBottom: "50px" }}>
          <div className="trending-text">
            <h1 className="trending-content-text">Trending Animes</h1>
            <Link to="/anime" style={{ textDecoration: "none" }}>
              <h1 type="button">
                <FaArrowCircleRight />
              </h1>
            </Link>
          </div>
          {renderCarousel(carouselAnimeArray)}
        </div>

        <div className="carousel-section" style={{ marginBottom: "50px" }}>
          <div className="trending-text">
            <h1 className="trending-content-text">Trending TV Movies</h1>
            <Link to="/tv" style={{ textDecoration: "none" }}>
              <h1 type="button">
                <FaArrowCircleRight className="view-all-button" />
              </h1>
            </Link>
          </div>
          {renderCarousel(carouselTvArray)}
        </div>
      </div>
    </>
  );
};

export default Home;
