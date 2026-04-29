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
import AiAssistant from "../natural-language-command-system-ai";

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
  const [question, setQuestion] = useState("");
  const [aiChats, setAiChats] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchLikesCount();
    fetchdislikeCount();
    fetchAllComments();
    fetchPreviousAiChats();
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
  const fetchPreviousAiChats = async () => {
    const movieId = id;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/fetch-ai-movie-chats/${movieId}`,
        { withCredentials: true },
      );
      console.log(res.data.result);
      const f = res.data.result.map((c) => ({
        query: c.query,
        response: c.response,
      }));
      setAiChats(f);

      fetchPreviousAiChats();
    } catch (err) {
      // alert(err);
    }
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
      // alert(err);
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
      // alert(err);
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
      // alert(err);
    }
  };

  const aiResponse = async () => {
    setAiLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai-movie-query",
        {
          question,
          movieId: movieInfo.id,
        },
        {
          withCredentials: true,
        },
      );
    } catch (err) {
      // alert(err);
    } finally {
      setAiLoading(false);
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    alert("Movie link copied to clipboard!");
  };

  return (
    <div className="each-movie-page">
      <AiAssistant />
      {isLoading && (
        <div className="loader-shell">
          <Loader
            type="BallTriangle"
            color="#2563eb"
            height="120"
            width="120"
          />
        </div>
      )}

      {isError && (
        <div className="error-panel">
          <h2>Sorry, we couldn't load this movie.</h2>
          <p>Please refresh or try again later.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <header className="movie-hero-panel">
            <div>
              <span className="hero-chip">Now Playing</span>
              <h1 className="hero-title">{movieInfo.title}</h1>
              <p className="hero-copy">
                Explore the full story, ratings, cast, and live audience
                reactions for this film.
              </p>
            </div>
            <div className="hero-meta">
              <span>{movieInfo.release_year}</span>
              <span>{movieInfo.genre}</span>
              <span>{movieInfo.country}</span>
            </div>
          </header>
          {!window.location.pathname.includes("/share/") && (
            <button
              onClick={() => {
                copyLink(`${window.location.origin}/share/${movieInfo.id}`);
              }}
            >
              🔗 Copy Link
            </button>
          )}

          {/* <a href={`${window.location.origin}/search/${movieInfo.title}/${movieInfo.id}`}>
            Share Movie Link
          </a> */}
          <main className="movie-layout">
            <section className="movie-player-panel">
              <div className="movie-player-card">
                <div className="movie-frame">
                  {movieInfo.imdbId ? (
                    <iframe
                      src={movieInfo.movielink}
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
                    />
                  )}
                </div>

                <div className="player-actions">
                  <button className="action-pill" onClick={addNewVideo}>
                    {isVideoAdded
                      ? "Remove from Watchlist"
                      : "Save to Watchlist"}
                  </button>
                  <button
                    className="action-pill alt"
                    onClick={fetchAllComments}
                  >
                    Refresh Comments
                  </button>
                </div>
              </div>

              <div className="movie-summary-card">
                <h2>Synopsis</h2>
                <p>
                  {movieInfo.description ||
                    "No synopsis available for this title."}
                </p>
              </div>
            </section>

            <aside className="movie-details-panel">
              <div className="tab-row">
                <button
                  className={`tab-pill ${!toggleAiMode ? "active" : ""}`}
                  onClick={() => setToggleAiMode(false)}
                >
                  Movie Info
                </button>
                <button
                  className={`tab-pill ${toggleAiMode ? "active" : ""}`}
                  onClick={() => setToggleAiMode(true)}
                >
                  AI Mode
                </button>
              </div>

              {toggleAiMode ? (
                <div className="ai-panel">
                  <div className="ai-chat-list">
                    {aiChats.length ? (
                      aiChats.map((chat, idx) => (
                        <div key={idx} className="ai-chat-item">
                          <p className="ai-query">Q: {chat.query}</p>
                          <p className="ai-response">A: {chat.response}</p>
                        </div>
                      ))
                    ) : (
                      <p className="ai-empty">Ask the AI about this movie.</p>
                    )}
                  </div>

                  {aiLoading && (
                    <div className="ai-loading-banner">
                      <div className="ai-loading-pulse">
                        <span />
                        <span />
                        <span />
                      </div>
                      <p>AI is generating a smart response...</p>
                    </div>
                  )}

                  <div className="ai-input-row">
                    <input
                      type="text"
                      className="ai-input"
                      placeholder="Ask about plot, cast, or trivia..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      disabled={aiLoading}
                    />
                    <button
                      className="ai-submit"
                      onClick={aiResponse}
                      disabled={aiLoading}
                    >
                      {aiLoading ? "Thinking..." : "Ask AI"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="info-panel">
                  <div className="stat-grid">
                    <article className="stat-card">
                      <span className="stat-value">{movieInfo.runtime}</span>
                      <span className="stat-label">Duration</span>
                    </article>
                    <article className="stat-card">
                      <span className="stat-value">{movieInfo.imdbRating}</span>
                      <span className="stat-label">IMDB Rating</span>
                    </article>
                    <article className="stat-card">
                      <span className="stat-value">{movieInfo.boxOffice}</span>
                      <span className="stat-label">Box Office</span>
                    </article>
                  </div>

                  <div className="detail-grid">
                    <div className="detail-row">
                      <span>Country</span>
                      <strong>{movieInfo.country}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Language</span>
                      <strong>{movieInfo.language}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Genre</span>
                      <strong>{movieInfo.genre}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Rated</span>
                      <strong>{movieInfo.rated}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Director</span>
                      <strong>{movieInfo.director}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Writer</span>
                      <strong>{movieInfo.writer}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Actors</span>
                      <strong>{movieInfo.actors}</strong>
                    </div>
                  </div>

                  <div className="reaction-row">
                    <button
                      className={`reaction-pill ${isLiked ? "liked" : ""}`}
                      onClick={() => {
                        likeMovie(movieInfo.id);
                        fetchLikesCount();
                        fetchdislikeCount();
                      }}
                    >
                      Like <span>{likes}</span>
                    </button>
                    <button
                      className={`reaction-pill ${isDisliked ? "disliked" : ""}`}
                      onClick={() => {
                        dislikeMovie(movieInfo.id);
                        fetchdislikeCount();
                        fetchLikesCount();
                      }}
                    >
                      Dislike <span>{dislikes}</span>
                    </button>
                  </div>

                  <div className="comment-box-panel">
                    <p className="comment-title">Post your thoughts</p>
                    <div className="comment-input-group">
                      <span className="comment-avatar-pill">
                        {currentUser?.name?.[0]?.toUpperCase() || "U"}
                      </span>
                      <textarea
                        className="comment-textarea"
                        placeholder="Write a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </div>
                    <button
                      className="comment-submit"
                      onClick={() => postComment(movieInfo.id)}
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              )}
            </aside>
          </main>
          <section className="comments-section">
            <div className="comments-header">
              <h2>Recent Comments</h2>
              <span>{comments.length} replies</span>
            </div>
            <div className="comments-grid">
              {comments.map((c) => (
                <div key={c.id} className="comment-card">
                  <div className="comment-avatar">
                    {c.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="comment-content">
                    <div className="comment-topline">
                      <span className="comment-user">{c.public_id}</span>
                      <span className="comment-time">
                        {new Date(c.posted_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="comment-text">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default EachMovie;
