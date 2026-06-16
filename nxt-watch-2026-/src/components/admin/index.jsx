import { useEffect, useState } from "react";
import axios from "axios";
import { FiUploadCloud, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import "./index.css";

const initialState = {
  title: "",
  tmdbID: "",
  //   posterpath: "",
  description: "",
  release_year: "",
  genre: "",
  imdbID: "",
  movieLINK: "",
  actors: "",
  director: "",
  writers: "",
  box_office: "",
  country: "",
};

const Admin = () => {
  const [movieData, setMovieData] = useState(initialState);
  //   const [posterFile, setPosterFile] = useState(null);
  //   const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ message: "", type: "success" });

  //   useEffect(() => {
  //     // if (!posterFile) {
  //     //   setPreviewUrl(movieData.posterpath || "");
  //     //   return;
  //     // }

  //     // const url = URL.createObjectURL(posterFile);
  //     // setPreviewUrl(url);
  //     // return () => URL.revokeObjectURL(url);
  //   }, [posterFile, movieData.posterpath]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMovieData((prev) => ({ ...prev, [name]: value }));
  };

  //   const handleFileChange = (event) => {
  //     const file = event.target.files?.[0] ?? null;
  //     setPosterFile(file);
  //     alert(posterFile);
  //     if (!file) {
  //       setPreviewUrl(movieData.posterpath || "");
  //     }
  //   };

  const handleReset = () => {
    setMovieData(initialState);
    // setPosterFile(null);
    setStatus({
      message: "Form cleared. Ready for a new movie.",
      type: "success",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: "Uploading movie details...", type: "success" });

    try {
    //   const formPayload = new FormData();
    //   Object.entries(movieData).forEach(([key, value]) => {
    //     formPayload.append(key, value);
    //   });
      // if (posterFile) {
      //   formPayload.append("posterFile", posterFile);
      // }

      await axios.post(
        `${import.meta.env.VITE_SERVER_URL || ""}/api/admin/upload-movie`,
        movieData,
        {
          //   headers: {
          //     "Content-Type": "multipart/form-data",
          //   },
          withCredentials: true,
        },
      );

      // console.log(formPayload);

      setStatus({ message: "Movie uploaded successfully.", type: "success" });
      setMovieData(initialState);
      // setPosterFile(null);
    } catch (error) {
      console.error(error);
      setStatus({
        message:
          error?.response?.data?.message ||
          "Unable to upload the movie. Please check your data and try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSummary = async (link) => {
    try {
      const summary = await axios.post(
        `${import.meta.env.VITE_SERVER_URL || ""}/api/generate-summary`,
        { movieLink: link },
        {
          withCredentials: true,
        },
      );
      alert(summary.data.summary);
      setMovieData((prev) => ({ ...prev, description: summary.data.summary }));
    } catch (err) {
      console.error("Error generating summary:", err);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <div className="admin-hero">
          <div className="admin-hero-copy">
            <span className="panel-badge">Admin Dashboard</span>
            <h1>Movie Upload Studio</h1>
            <p>
              Add new catalog entries with complete metadata, poster assets, and
              vector embeddings for smarter discovery. The form is built to be
              fully responsive across mobile, tablet, and desktop.
            </p>
            <div className="hero-stats-grid">
              <div className="hero-stat-card">
                <span className="hero-stat-label">Catalog range</span>
                <strong>3,200+ titles</strong>
              </div>
              <div className="hero-stat-card">
                <span className="hero-stat-label">AI similarity</span>
                <strong>99% accuracy</strong>
              </div>
              <div className="hero-stat-card">
                <span className="hero-stat-label">Upload time</span>
                <strong>~2 seconds</strong>
              </div>
            </div>
          </div>
          <div className="admin-hero-panel">
            <div className="panel-heading">
              <h2>Upload workflow</h2>
              <span className="panel-badge">Fast entry</span>
            </div>
            <p>
              Use the fields below to seed new movies into the platform. Poster
              uploads and metadata are organized for a polished SaaS experience.
            </p>
            <div className="preview-details">
              <div className="preview-detail">
                <strong>Rich metadata</strong>
                title, genre, rating, cast, crew, and distribution detail.
              </div>
              <div className="preview-detail">
                <strong>AI-ready</strong>
                vector embeddings field included for similarity search.
              </div>
              <div className="preview-detail">
                <strong>Image-first</strong>
                poster preview updates instantly whether you use a URL or
                upload.
              </div>
              <div className="preview-detail">
                <strong>Responsive form</strong>
                works beautifully on phones, tablets, and large screens.
              </div>
            </div>
          </div>
        </div>

        <div className="admin-grid">
          <section className="admin-form-card">
            <div className="panel-heading">
              <h2>Movie metadata</h2>
              <span className="panel-badge">Upload</span>
            </div>
            {status.message && (
              <div
                className={`admin-status admin-status--${
                  status.type === "error" ? "error" : "success"
                }`}
              >
                {status.type === "error" ? (
                  <FiAlertTriangle size={18} />
                ) : (
                  <FiCheckCircle size={18} />
                )}
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="admin-movie-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">Movie title</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={movieData.title}
                    onChange={handleChange}
                    placeholder="Enter movie name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tmdbID">TMDB ID</label>
                  <input
                    id="tmdbID"
                    name="tmdbID"
                    type="text"
                    value={movieData.tmdbID}
                    onChange={handleChange}
                    placeholder="e.g. 12345"
                  />
                </div>
                {/* <div className="form-group">
                  <label htmlFor="posterpath">Poster URL</label>
                  <input
                    id="posterpath"
                    name="posterpath"
                    type="url"
                    value={movieData.posterpath}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div> */}
                <div className="form-group">
                  <label htmlFor="movieLINK">Movie link</label>
                  <input
                    id="movieLINK"
                    name="movieLINK"
                    type="url"
                    value={movieData.movieLINK}
                    onChange={handleChange}
                    placeholder="Movie stream or embed URL"
                  />
                </div>
                <div className="form-group form-grid--full">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={movieData.description}
                    onChange={handleChange}
                    placeholder="Write a short synopsis for the movie"
                    required
                  />
                  <button
                    onClick={() => generateSummary(movieData.movieLINK)}
                    type="button"
                  >
                    AI Generate
                  </button>
                </div>
                <div className="form-group">
                  <label htmlFor="release_year">Release year</label>
                  <input
                    id="release_year"
                    name="release_year"
                    type="number"
                    value={movieData.release_year}
                    onChange={handleChange}
                    placeholder="2026"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="genre">Genre</label>
                  <input
                    id="genre"
                    name="genre"
                    type="text"
                    value={movieData.genre}
                    onChange={handleChange}
                    placeholder="Action, Drama, Sci-fi"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="imdbID">IMDB ID</label>
                  <input
                    id="imdbID"
                    name="imdbID"
                    type="text"
                    value={movieData.imdbID}
                    onChange={handleChange}
                    placeholder="tt1234567"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={movieData.country}
                    onChange={handleChange}
                    placeholder="United States"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="actors">Actors</label>
                  <input
                    id="actors"
                    name="actors"
                    type="text"
                    value={movieData.actors}
                    onChange={handleChange}
                    placeholder="List the main cast"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="director">Director</label>
                  <input
                    id="director"
                    name="director"
                    type="text"
                    value={movieData.director}
                    onChange={handleChange}
                    placeholder="Director name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="writers">Writers</label>
                  <input
                    id="writers"
                    name="writers"
                    type="text"
                    value={movieData.writers}
                    onChange={handleChange}
                    placeholder="Writer names"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="box_office">Box office</label>
                  <input
                    id="box_office"
                    name="box_office"
                    type="text"
                    value={movieData.box_office}
                    onChange={handleChange}
                    placeholder="$450M"
                  />
                </div>
                {/* <div className="form-group form-grid--full">
                  <label htmlFor="vector_embeddings">Vector embeddings</label>
                  <textarea
                    id="vector_embeddings"
                    name="vector_embeddings"
                    value={movieData.vector_embeddings}
                    onChange={handleChange}
                    placeholder="Paste comma-separated embedding values or JSON array"
                  />
                </div> */}
              </div>

              {/* <div className="upload-row">
                <div className="upload-field">
                  <span>
                    <FiUploadCloud size={20} /> Poster file upload
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div> */}

              <div className="admin-actions">
                <button
                  type="submit"
                  className="admin-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Uploading..." : "Upload Movie"}
                </button>
                <button
                  type="button"
                  className="admin-secondary"
                  onClick={handleReset}
                >
                  Reset form
                </button>
              </div>
            </form>
          </section>

          {/* <aside className="admin-preview-card">
            <h3>Live upload preview</h3>
            <div className="preview-panel">
              <div className="preview-card preview-image">
                {previewUrl ? (
                  <img src={previewUrl} alt="Poster preview" />
                ) : (
                  <div className="preview-placeholder">
                    <span>Poster preview will appear here</span>
                  </div>
                )}
              </div>
              <div className="preview-copy">
                <h4>{movieData.title || "Movie title will appear here"}</h4>
                <p>
                  {movieData.description ||
                    "Movie description and summary text appear as you fill the form."}
                </p>
              </div>
              <div className="preview-details">
                <div className="preview-detail">
                  <strong>Release year</strong>
                  {movieData.release_year || "-"}
                </div>
                <div className="preview-detail">
                  <strong>Genre</strong>
                  {movieData.genre || "-"}
                </div>
                <div className="preview-detail">
                  <strong>Director</strong>
                  {movieData.director || "-"}
                </div>
                <div className="preview-detail">
                  <strong>Country</strong>
                  {movieData.country || "-"}
                </div>
              </div>
            </div>
          </aside> */}
        </div>
      </div>
    </div>
  );
};

export default Admin;
