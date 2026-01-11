import { useState, useEffect, useContext } from "react";
import Loader from "react-loader-spinner";
import { MdRestore, MdCancel } from "react-icons/md";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaPlay, FaPause } from "react-icons/fa";
import SavedVideosContext from "../../createContext";
import Header from "../header";
import "./index.css";

const languageArray = [
  { lan: "Hindi", id: "Hindi" },
  { lan: "Sanskrit", id: "SANSKRIT" },
  { lan: "English", id: "ENGLISH" },
  { lan: "Marathi", id: "MARATHI" },
  { lan: "Telgu", id: "TELGU" },
  { lan: "Tamil", id: "TAMIL" },
  { lan: "French", id: "FRENCH" },
];

const EachMovie = () => {
  const { title, id } = useParams();
  const { addVideo, removeVideo } = useContext(SavedVideosContext);

  const [currentLanguage, setCurrentLanguage] = useState(languageArray[2].id);
  const [movieInfo, setMovieInfo] = useState({});
  const [movieTrailer, setMovieTrailer] = useState({});
  const [tmdbMovieInfo, setTmdbMovieInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isVideoAdded, setIsVideoAdded] = useState(false);
  const [summary, setSummary] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [paused, setPaused] = useState(false);
  const [fetchSummary, setFetchSummary] = useState(false);
  const [similarMovies, setSimilarMovies] = useState([]);

  const geminiApi = import.meta.env.VITE_GEMINI_API_KEY;

  /* ------------------ SPEECH UTILS (NATIVE) ------------------ */

  const speak = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;
    window.speechSynthesis.speak(utterance);
  };

  const cancelSpeech = () => {
    window.speechSynthesis.cancel();
  };

  /* ------------------ API CALLS ------------------ */

  const getFullMovieInfo = async () => {
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?t=${title}&apikey=14dc6453`
      );
      const data = await res.json();

      setMovieInfo({
        title: data.Title,
        poster: data.Poster,
        year: data.Year,
        genre: data.Genre,
        plot: data.Plot,
        imdbID: data.imdbID,
        released: data.Released,
        runtime: data.Runtime,
        imdbRating: data.imdbRating,
        boxOffice: data.BoxOffice,
        country: data.Country,
        language: data.Language,
        director: data.Director,
        actors: data.Actors,
        rated: data.Rated,
        writer: data.Writer,
      });

      setIsLoading(false);
    } catch {
      setError(true);
      setIsLoading(false);
    }
  };

  const getMovieTrailer = async () => {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/videos?api_key=04c35731a5ee918f014970082a0088b1`
    );
    const data = await res.json();
    setMovieTrailer({ key: data.results?.[0]?.key });
  };

  const getTmdbMovieInfo = async () => {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=04c35731a5ee918f014970082a0088b1&query=${title}`
    );
    const data = await res.json();
    setTmdbMovieInfo(data.results?.[0] || {});
  };

  const extractArrayFromText = (text) => {
    const match = text.match(/\[([\s\S]*?)\]/);
    if (match) {
      setSimilarMovies(JSON.parse(match[0]));
    }
  };

  const geminiResponse = async () => {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApi}`,
      {
        contents: [
          {
            parts: [
              {
                text: `List 10 movies similar to "${title}" in JSON array format`,
              },
            ],
          },
        ],
      }
    );
    extractArrayFromText(res.data.candidates[0].content.parts[0].text);
  };

  const getMovieHighlights = async () => {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApi}`,
      {
        contents: [
          {
            parts: [{ text: `full summary of ${title} in ${currentLanguage}` }],
          },
        ],
      }
    );

    setSummary(res.data.candidates[0].content.parts[0].text);
  };

  const getMovieHighlights2 = async (lang) => {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${geminiApi}`,
      {
        contents: [
          {
            parts: [{ text: `provide summary of ${title} in ${lang.lan}` }],
          },
        ],
      }
    );

    setSummary(res.data.candidates[0].content.parts[0].text);
  };

  /* ------------------ EFFECTS ------------------ */

  useEffect(() => {
    getFullMovieInfo();
    getMovieTrailer();
    getTmdbMovieInfo();
    geminiResponse();
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setSelectedVoice(voices.find((v) => v.lang === "hi-IN") || voices[0]);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  /* ------------------ ACTIONS ------------------ */

  const addNewVideo = () => {
    addVideo(tmdbMovieInfo);
    setIsVideoAdded(true);
  };

  const removeSelectedVideo = () => {
    removeVideo(tmdbMovieInfo);
    setIsVideoAdded(false);
  };

  const pause = () => {
    setPaused(!paused);
    paused ? window.speechSynthesis.resume() : window.speechSynthesis.pause();
  };

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang.id);
    cancelSpeech();
    setSummary("");
    getMovieHighlights2(lang);
  };

  const fetching = () => {
    setFetchSummary(true);
    getMovieHighlights();
  };

  /* ------------------ RENDER ------------------ */

return (
  <div className="nav-div">
    <div className="sticky-navbar">
      <Header />
    </div>

    <div>
      {isLoading && (
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
      )}

      {error && <p>Something went wrong. Please try again.</p>}

      {!isLoading && !error && (
        <>
          <div className="bg-container">
            <div className="video-container">
              {movieInfo.imdbID ? (
                <iframe
                  src={`https://2embed.cc/embed/${movieInfo.imdbID}`}
                  allowFullScreen
                  frameBorder="0"
                  title="Movie Video"
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <iframe
                  src={`https://www.youtube.com/embed/${movieTrailer.key}`}
                  allowFullScreen
                  frameBorder="0"
                  title="Trailer"
                  allow="autoplay; encrypted-media"
                  height="400px"
                  width="500px"
                />
              )}
            </div>

            <div className="movie-info-container">
              <div className="movie-info-1">
                <div className="heading-zone">
                  <h1 className="title" style={{ fontWeight: "bold" }}>
                    {movieInfo.title}
                  </h1>
                </div>

                <div className="date-zone">
                  <h1 className="released" style={{ fontWeight: "bold" }}>
                    {movieInfo.released}
                  </h1>
                </div>
              </div>

              <div className="movie-info-1">
                <div className="heading-zone">
                  <h1 className="title" style={{ fontWeight: "bold" }}>
                    Highlights Language
                  </h1>
                </div>

                {fetchSummary ? (
                  summary ? (
                    <div className="movie-info-1">
                      <div className="heading-zone">
                        <h1 className="title" style={{ fontWeight: "bold" }}>
                          Highlights
                        </h1>
                      </div>

                      {paused && (
                        <div className="loader-container">
                          <Loader
                            type="oval"
                            color="black"
                            height="20"
                            width="90"
                          />
                        </div>
                      )}

                      <div
                        className="date-zone"
                        role="button"
                        tabIndex={0}
                        onClick={pause}
                      >
                        {paused ? (
                          <div className="play-cancel">
                            <FaPause
                              onClick={() => window.speechSynthesis.pause()}
                            />
                            <MdCancel onClick={cancelSpeech} />
                          </div>
                        ) : (
                          <FaPlay onClick={() => speak(summary)} />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="loader-container">
                      <Loader
                        type="ThreeDots"
                        color="black"
                        height="50"
                        width="50"
                      />
                    </div>
                  )
                ) : (
                  <button type="button" onClick={fetching}>
                    Set
                  </button>
                )}

                <div className="date-zone">
                  <select
                    value={currentLanguage}
                    onChange={(e) =>
                      changeLanguage(
                        languageArray.find((l) => l.id === e.target.value)
                      )
                    }
                  >
                    {languageArray.map((each) => (
                      <option key={each.id} value={each.id}>
                        {each.lan}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="save-video-button-container">
            {isVideoAdded ? (
              <button
                type="button"
                className="saved-video-button"
                onClick={removeSelectedVideo}
              >
                <MdRestore /> remove video
              </button>
            ) : (
              <button
                type="button"
                className="saved-video-button"
                onClick={addNewVideo}
              >
                <MdRestore
                  style={{
                    fontWeight: "bold",
                    fontSize: "19px",
                    marginRight: "10px",
                  }}
                />
                Save Movie
              </button>
            )}
          </div>

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
                        'https://m.media-amazon.com/images/M/MV5BMmFiZGZjMmEtMTA0Ni00MzA2LTljMTYtZGI2MGJmZWYzZTQ2XkEyXkFqcGc@._V1_SX300.jpg'
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
        </>
      )}
    </div>
  </div>
);

};

export default EachMovie;
