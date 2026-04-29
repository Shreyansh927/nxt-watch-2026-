import React, { useState } from "react";
import WatchHistory from "../watch-history/watch-history.jsx";
import Header from "../header/index.jsx";
import "./index.css";
import { Link, useNavigate } from "react-router-dom";
import { IoMdAdd } from "react-icons/io";
import axios from "axios";
import WatchLater from "../watch-later/index.jsx";
import { useEffect } from "react";
import AiAssistant from "../natural-language-command-system-ai/index.jsx";

const Library = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [publicId, setPublicId] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [movie, setMovie] = useState(null);
  useEffect(() => {
    fetchProfile();
    fetchContinue();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/me`, {
        withCredentials: true,
      });
      console.log(res.data.user);
      setUserInfo(res.data.user);
      setName(res.data.user.name || "");
      setPublicId(res.data.user.public_id || "");
      setProfilePicture(res.data.user.profile_image || null);
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  const fetchContinue = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/continue-watching`,
        {
          withCredentials: true,
        },
      );

      setMovie(res.data.result);
    } catch (err) {
      alert(err);
    }
  };

  const updateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("public_id", publicId);

      // only append if file exists
      if (profilePicture) {
        formData.append("profile_image", profilePicture);
      }

      const res = await axios.put(
        `${import.meta.env.VITE_SERVER_URL}/api/update-profile`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log(res.data.message);
      fetchProfile();
      setEditMode(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="main">
        <AiAssistant />
        <section className="profile-container">
          <div
            className="page-heading"
            style={{ display: "flex", justifyContent: "flex-start" }}
          >
            <div>
              <h1>Library Dashboard</h1>
              <p>
                Manage your profile details, review your watch history, and
                revisit saved videos from one polished workspace.
              </p>
            </div>
          </div>

          <div className="profile-card">
            <div className="profile-header">
              <div>
                <h2>Your Profile</h2>
                <p>
                  Update your account details and personalize your library
                  experience.
                </p>
              </div>
              <div className="profile-avatar">
                {editMode ? (
                  <label className="avatar-upload">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setPreviewUrl(URL.createObjectURL(file));
                        setProfilePicture(file);
                      }}
                    />
                    Upload image
                  </label>
                ) : null}
                <img
                  src={previewUrl || profilePicture || userInfo?.profile_image}
                  alt="Profile"
                />
              </div>
            </div>

            <div className="profile-content">
              <div className="profile-row">
                <span>Name</span>
                {!editMode ? (
                  <p>{userInfo?.name || "Not provided"}</p>
                ) : (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                )}
              </div>

              <div className="profile-row">
                <span>Email</span>
                <p>{userInfo?.email || "Not available"}</p>
              </div>

              <div className="profile-row">
                <span>Public ID</span>
                {editMode ? (
                  <input
                    type="text"
                    value={publicId}
                    onChange={(e) => setPublicId(e.target.value)}
                  />
                ) : (
                  <p>{userInfo?.public_id || "Not set"}</p>
                )}
              </div>
            </div>

            <div className="profile-actions">
              {!editMode ? (
                <button onClick={() => setEditMode(true)}>Edit Profile</button>
              ) : (
                <div className="action-group">
                  <button
                    onClick={() => {
                      updateProfile();
                      setEditMode(false);
                    }}
                  >
                    Save Changes
                  </button>
                  <button onClick={() => setEditMode(false)}>Cancel</button>
                </div>
              )}
            </div>
          </div>

          <section className="watch-summary">
            <div className="watch-header">
              <div>
                <h2>Watch History</h2>
                <p>
                  Review your recent activity and continue watching where you
                  left off.
                </p>
              </div>
              <button
                className="history-btn"
                onClick={() => navigate("/library/watch-history")}
              >
                Watch Full History
              </button>
            </div>
          </section>

          <div className="divider" />

          <section className="watch-later-section">
            <h2>Saved For Later</h2>
            <p>Quick access to the videos you marked to watch later.</p>
            <WatchLater />
          </section>
          <div style={{display: "flex", justifyContent: "space-between"}}>
            <div
              className="analytics-card"
              onClick={() => navigate("/analytics")}
            >
              <div className="analytics-header">
                <h3>📊 Analytics</h3>
                <span className="view-more">View →</span>
              </div>

              <div className="analytics-stats">
                <div>
                  <p className="stat-value">12h</p>
                  <p className="stat-label">Watch Time</p>
                </div>
                <div>
                  <p className="stat-value">8</p>
                  <p className="stat-label">Movies</p>
                </div>
                <div>
                  <p className="stat-value">Sci-Fi</p>
                  <p className="stat-label">Top Genre</p>
                </div>
              </div>

              <div className="analytics-graph">
                <div className="bar" style={{ height: "40%" }}></div>
                <div className="bar" style={{ height: "70%" }}></div>
                <div className="bar" style={{ height: "50%" }}></div>
                <div className="bar" style={{ height: "90%" }}></div>
                <div className="bar" style={{ height: "60%" }}></div>
              </div>
            </div>
            <section className="analytics-card" style={{width: "50%"}}>
              <div
                className="page-heading"
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <h2>Continue Watching ...</h2>
                </div>
              </div>

              <li
                key={movie?.id}
                className="search-movie-card"
                style={{
                  backgroundImage: `url(https://image.tmdb.org/t/p/w500${movie?.backdrop})`,
                  width: "50%",
                  height: "200px",
                  objectFit: "cover",
                }}
              >
                <Link
                  to={`/trending/${encodeURIComponent(movie?.title)}/${movie?.id}`}
                  className="search-movie-link"
                >
                  <div className="search-movie-overlay">
                    <div className="search-movie-info">
                      <h3 className="search-movie-title">{movie?.title}</h3>
                      <div className="search-movie-meta">
                        <span className="search-release-year">
                          {movie?.releaseYear}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            </section>
          </div>

          <div className="continue-watching-section"></div>
        </section>
      </div>
    </>
  );
};

export default Library;
