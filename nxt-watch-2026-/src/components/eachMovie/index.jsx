import { useState, useEffect, useContext } from "react";
import Loader from "react-loader-spinner";
import { MdRestore, MdCancel } from "react-icons/md";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaPlay, FaPause } from "react-icons/fa";
// import { useSpeechSynthesis } from "react-speech-kit";
import SavedVideosContext from "../../createContext";
import { BiDislike } from "react-icons/bi";
import Header from "../header";
import { useQuery } from "@tanstack/react-query";
import { AiOutlineLike } from "react-icons/ai";
import "./index.css";

const languageArray = [
  {
    lan: "Hindi",
    id: "Hindi",
  },
  {
    lan: "Sanskrit",
    id: "SANSKRIT",
  },
  {
    lan: "English",
    id: "ENGLISH",
  },
  {
    lan: "Marathi",
    id: "MARATHI",
  },
  {
    lan: "Telgu",
    id: "TELGU",
  },
  {
    lan: "Tamil",
    id: "TAMIL",
  },
  {
    lan: "French",
    id: "FRENCH",
  },
];

const EachMovie = () => {
  const { title, id } = useParams();
  const { addVideo, removeVideo } = useContext(SavedVideosContext);
  // const { speak, cancel } = useSpeechSynthesis();
  const [currentLanguage, setCurrentLanguage] = useState(languageArray[2].id);
  const [movieTrailer, setMovieTrailer] = useState({});
  const [tmdbMovieInfo, setTmdbMovieInfo] = useState({});
  const [suggestedMovies, setSuggestedMovies] = useState([]);

  const [error, setError] = useState(false);
  const [isVideoAdded, setIsVideoAdded] = useState(false);
  const [summary, setSummary] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [paused, setPaused] = useState(false);
  const [likes, setLikes] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [fetchSummary, setFetchSummary] = useState(false);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );
  const geminiApi = import.meta.env.VITE_GEMINI_API_KEY;
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [toggleAiMode, setToggleAiMode] = useState(false);

  useEffect(() => {
    fetchLikesCount();
    fetchdislikeCount();
    fetchAllComments();
  }, []);
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const key in intervals) {
      const value = Math.floor(seconds / intervals[key]);
      if (value > 0) {
        return `${value} ${key}${value > 1 ? "s" : ""} ago`;
      }
    }

    return "Just now";
  };
  const fetchAllComments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/get-movie-comments/${id}`,
        {
          withCredentials: true,
        },
      );

      const f = res.data.result.map((c) => ({
        id: c.id,
        public_id: c.public_id,
        content: c.content,
        posted_at: c.posted_at,
        name: c.name,
      }));

      setComments(f);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchLikesCount = async () => {
    const movieId = id;
    const res = await axios.get(
      `http://localhost:5000/api/get-movie-likes-count/${movieId}`,
      {
        withCredentials: true,
      },
    );

    setLikes(res.data.result);
    if (res.data.isPresent) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  };

  const fetchdislikeCount = async () => {
    const movieId = id;
    const res = await axios.get(
      `http://localhost:5000/api/get-movie-dislikes-count/${movieId}`,
      {
        withCredentials: true,
      },
    );

    setDislikes(res.data.result);
    if (res.data.isPresent) {
      setIsDisliked(true);
    } else {
      setIsDisliked(false);
    }
  };

  const getFullMovieInfo = async ({ queryKey }) => {
    const [_key, id] = queryKey;
    const api = `http://localhost:5000/api/get-movie/${id}`;
    const response = await axios.get(api);
    const formatted = {
      id: response.data.movie.id,
      title: response.data.movie.title,
      release_year: response.data.movie.release_year,
      genre: response.data.movie.genre,
      runtime: response.data.movie.runtime,
      imdbId: response.data.movie.imdb_id,
      imdbRating: response.data.movie.imdb_rating,
      boxOffice: response.data.movie.box_office,
      country: response.data.movie.country,
      description: response.data.movie.description,
      movielink: response.data.movie.movielink,
    };
    return formatted;
  };

  const {
    data: movieInfo,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["full-movie-info", id],
    queryFn: getFullMovieInfo,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch trailer
  const getMovieTrailer = async () => {
    try {
      const trailerApi = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=04c35731a5ee918f014970082a0088b1`;
      const response = await fetch(trailerApi);
      const jsonData = await response.json();

      setMovieTrailer({ key: jsonData.results?.[0]?.key });
    } catch {
      console.log("error fetching trailer");
    }
  };

  // Fetch TMDB info
  const getTmdbMovieInfo = async () => {
    try {
      const tmdbApi = `https://api.themoviedb.org/3/search/movie?api_key=04c35731a5ee918f014970082a0088b1&page=1&query=${title}`;
      const response = await fetch(tmdbApi);
      const jsonData = await response.json();

      setTmdbMovieInfo(jsonData.results?.[0] || {});
    } catch {
      console.log("error fetching tmdb info");
    }
  };

  // Suggested movies
  const getSuggestedMovies = async () => {
    try {
      const api = `https://api.themoviedb.org/3/search/movie?api_key=04c35731a5ee918f014970082a0088b1&query=${title}`;
      const response = await fetch(api);
      const jsonData = await response.json();
      const formatted = jsonData.results.map((each) => ({
        originalTitle: each.original_title,
        overview: each.overview,
        id: each.id,
        posterPath: each.poster_path,
        releaseDate: each.release_date,
        averageVotes: each.vote_average,
        backdropPath: each.backdrop_path,
        title: each.title,
      }));
      setSuggestedMovies(formatted);
    } catch {
      console.log("error fetching suggested movies");
    }
  };

  // Movie Highlights (Gemini)
  const getMovieHighlights = async () => {
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApi}`,
        method: "post",
        data: {
          contents: [
            {
              parts: [
                { text: `full summary of ${title} in ${currentLanguage}` },
              ],
            },
          ],
        },
      });
      const ans = response.data.candidates[0].content.parts[0].text;
      const ans2 = ans.split("**").map((item) => item.replaceAll("*", ""));
      setSummary(ans2.join(" "));
      console.log(ans2);
    } catch (err) {
      console.error("Error during API call:", err);
    }
  };

  const extractArrayFromText = (text) => {
    const match = text.match(/\[([\s\S]*?)\]/);
    if (match) {
      const parsedArray = JSON.parse(match[0]);
      console.log(parsedArray);
      setSimilarMovies(parsedArray);
    }
  };

  // get simlar movies

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
                  text: `List 10 movies similar to "${title}" in a JSON array of objects with keys: originalTitle, overview, id, posterPath, releaseDate, averageVotes, backdropPath, title, Poster.`,
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
  const getMovieHighlights2 = async (e) => {
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${geminiApi}`,
        method: "post",
        data: {
          contents: [
            {
              parts: [{ text: `provide summary of ${title} in ${e.lan}` }],
            },
          ],
        },
      });
      const ans = response.data.candidates[0].content.parts[0].text.replaceAll(
        "**",
        "",
      );

      setSummary(ans);
    } catch (err) {
      console.error("Error during API call:", err);
    }
  };

  // Effects
  useEffect(() => {
    getMovieTrailer();
    getTmdbMovieInfo();
    getSuggestedMovies();
    geminiResponse();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();

      // Select Hindi voice if available
      const hindi = availableVoices.find((v) => v.lang === "hi-IN");
      setSelectedVoice(hindi || availableVoices[0]);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Save/remove video
  const addNewVideo = () => {
    addVideo(tmdbMovieInfo);
    setIsVideoAdded((prev) => !prev);
  };

  const removeSelectedVideo = () => {
    removeVideo(tmdbMovieInfo);
    setIsVideoAdded((prev) => !prev);
  };

  const pause = () => {
    setPaused(!paused);
  };

  const func = () => {
    window.speechSynthesis.resume();
    speak({ text: summary, voice: selectedVoice });
  };

  const stopSpeaker = () => {
    cancel();
  };

  const changeLanguage = (each) => {
    setCurrentLanguage(each.id);
    setSummary("");
    cancel();
    setPaused(false);
    getMovieHighlights2(each); // fetch new summary
  };

  const fetching = () => {
    setFetchSummary(true);
    getMovieHighlights();
  };

  const likeMovie = async (movieId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/like/${movieId}`,
        {},
        {
          withCredentials: true,
        },
      );

      fetchLikesCount();
    } catch (err) {
      console.log(err);
      alert(err);
    }
  };

  const dislikeMovie = async (movieId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/dislike/${movieId}`,
        {},
        {
          withCredentials: true,
        },
      );

      fetchdislikeCount();
    } catch (err) {
      console.log(err);
      alert(err);
    }
  };

  const postComment = async (movieId) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/comment",
        {
          movieId,
          content: comment,
        },
        {
          withCredentials: true,
        },
      );
      fetchAllComments();
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className="nav-div">
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

        {isError && <p>Something went wrong. Please try again.</p>}

        {!isLoading && !isError && (
          <>
            <div className="bg-container">
              <div className="video-container">
                {movieInfo.imdbId ? (
                  <>
                    <iframe
                      src={movieInfo.movielink}
                      allowFullScreen
                      frameBorder="0"
                      title="Movie Video"
                      allow="autoplay; encrypted-media"
                    />
                  </>
                ) : (
                  <>
                    <iframe
                      src={`https://www.youtube.com/embed/${movieTrailer.key}`}
                      allowFullScreen
                      frameBorder="0"
                      title="Trailer"
                      allow="autoplay; encrypted-media"
                      height="400px"
                      width="500px"
                    />
                  </>
                )}
              </div>

              <div className="movie-info-container">
                {/* Movie details */}
                <div className="cl">
                  <h4 className="ai" onClick={() => setToggleAiMode(false)}>
                    Movie Info
                  </h4>
                  <h4 className="ai" onClick={() => setToggleAiMode(true)}>
                    AI Mode
                  </h4>
                </div>
                {toggleAiMode ? (
                  <h1>hello ai</h1>
                ) : (
                  <>
                    <div className="movie-info-1">
                      <div className="heading-zone">
                        <p className="released">{movieInfo.title}</p>
                      </div>

                      <div className="date-zone">
                        <p className="released">{movieInfo.release_year}</p>
                      </div>
                    </div>

                    <div className="movie-info-1">
                      <div className="heading-zone">
                        <div className="heading-zone">
                          <div className="like">
                            <AiOutlineLike
                              onClick={() => {
                                likeMovie(movieInfo.id);
                                fetchLikesCount();
                                fetchdislikeCount();
                              }}
                              className={isLiked ? "blue" : "white"}
                            />
                            <p className="l">{likes}</p>
                          </div>
                        </div>
                      </div>

                      <div className="date-zone">
                        <div className="like">
                          <BiDislike
                            onClick={() => {
                              dislikeMovie(movieInfo.id);
                              fetchdislikeCount();
                              fetchLikesCount();
                            }}
                            className={isDisliked ? "blue" : "white"}
                          />
                          <p className="l">{dislikes}</p>
                        </div>
                      </div>
                    </div>

                    <div className="hr-line-zone">
                      <hr className="hr" />
                    </div>

                    <div className="movie-info-2">
                      <div className="movie-info-2-sec1">
                        <h1 className="duration">{movieInfo.runtime}</h1>
                        <h3 className="h3-1">Duration</h3>
                      </div>
                      <div className="movie-info-2-sec1">
                        <h1 className="imdbRating">{movieInfo.imdbRating}</h1>
                        <h3 className="h3-1">IMDB Rating</h3>
                      </div>
                      <div className="movie-info-2-sec1">
                        <h1 className="runtime">{movieInfo.boxOffice}</h1>
                        <h3 className="h3-1">Box Office</h3>
                      </div>
                    </div>

                    <div className="hr-line-zone">
                      <hr className="hr" />
                    </div>

                    <div className="movie-info-2">
                      <div className="movie-info-2-sec1">
                        <h1 className="duration" style={{ textAlign: "start" }}>
                          {movieInfo.country}
                        </h1>
                        <h3 className="h3-1">Country</h3>
                      </div>
                      <div className="movie-info-2-sec1">
                        <h1 className="imdbRating">{movieInfo.language}</h1>
                        <h3 className="h3-1">Language</h3>
                      </div>
                    </div>

                    <div className="hr-line-zone">
                      <hr className="hr" />
                    </div>

                    <div className="movie-info-2">
                      <div className="movie-info-2-sec1">
                        <h1 className="imdbRating">{movieInfo.genre}</h1>
                        <h3 className="h3-1">Genre</h3>
                      </div>
                      <div className="movie-info-2-sec1">
                        <h1 className="duration">{movieInfo.rated}</h1>
                        <h3 className="h3-1">Rated</h3>
                      </div>
                    </div>

                    <div className="hr-line-zone">
                      <hr className="hr" />
                    </div>

                    <div className="movie-info-2">
                      <div className="movie-info-2-sec1">
                        <h1 className="imdbRating">{movieInfo.director}</h1>
                        <h3 className="h3-1">Director</h3>
                      </div>
                    </div>

                    <div className="hr-line-zone">
                      <hr className="hr" />
                    </div>

                    <div className="movie-info-2">
                      <div className="movie-info-2-sec1">
                        <h1 className="duration actors">{movieInfo.actors}</h1>
                        <h3 className="h3-1">Actors</h3>
                      </div>
                    </div>

                    <div className="hr-line-zone">
                      <hr className="hr" />
                    </div>

                    <div className="movie-info-2">
                      <div className="movie-info-2-sec1">
                        <h1 className="duration actors">{movieInfo.writer}</h1>
                        <h3 className="h3-1">Writer</h3>
                      </div>
                    </div>

                    <div className="hr-line-zone">
                      <hr className="hr" />
                    </div>

                    <div className="movie-info-2">
                      <div className="movie-info-2-sec1">
                        <h3 className="h3-1">Plot</h3>
                      </div>
                    </div>

                    <div className="hr-line-zone">
                      <hr className="hr" />
                    </div>

                    <div className="heading-zone">
                      <h3 className="h3-1">Comment...</h3>
                      <div className="user-comment">
                        <p
                          className={
                            comment.trim().length ? "cu-animate" : "cu"
                          }
                        >
                          {currentUser.name.split("")[0]}
                        </p>
                        <textarea
                          name="text-area"
                          id=""
                          className="comment-box"
                          placeholder="comment..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                      </div>
                      <div className="bu">
                        <button
                          className="post"
                          onClick={() => postComment(movieInfo.id)}
                        >
                          Post
                        </button>
                      </div>
                    </div>

                    <div className="hr-line-zone">
                      <hr className="hr" />
                    </div>

                    <div className="movie-info-2">
                      <div className="movie-info-2-sec1">
                        <h3 className="h3-1">Others commments</h3>
                      </div>
                    </div>

                    <div className="comments-container">
                      {comments.map((c) => (
                        <>
                          <div
                            key={c.id}
                            className="comment-card"
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div style={{ display: "flex" }}>
                              <div className="comment-avatar">
                                {c.name[0].toUpperCase()}
                              </div>

                              <div className="comment-body">
                                <div className="comment-header">
                                  <span className="comment-user">
                                    {c.public_id}
                                  </span>
                                </div>

                                <p className="comment-text">{c.content}</p>
                              </div>
                            </div>

                            <div style={{ marginRight: "20px" }}>
                              <span className="comment-time">
                                {new Date(c.posted_at).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                        </>
                      ))}
                    </div>
                  </>
                )}
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
                    to={`/trending/${encodeURIComponent(movie.title)}/${movie.id}`}
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
          </>
        )}
      </div>
    </div>
  );
};

export default EachMovie;
