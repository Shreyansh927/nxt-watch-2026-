import "./index.css";
import { useNavigate } from "react-router-dom";
import { IoMdAdd, IoMdSettings, IoMdClose } from "react-icons/io";
import { MdOutlineFolder } from "react-icons/md";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import fetchWatchLaterFolders from "../../../fetch-all-watch-later-folders";
import AiAssistant from "../natural-language-command-system-ai";

const allFolderStatus = [
  { id: 1, status: "PUBLIC" },
  { id: 2, status: "PRIVATE" },
];

const WatchLater = () => {
  const [folderName, setFolderName] = useState("");
  const [folderStatus, setFolderStatus] = useState(allFolderStatus[0].status);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [watchLaterFolders, setWatchLaterFolders] = useState([]);
  const [folderToUpdate, setFolderToUpdate] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchLatestFolders();
  }, []);

  const fetchLatestFolders = async () => {
    try {
      const res = await fetchWatchLaterFolders(
        `${import.meta.env.VITE_SERVER_URL}/api/get-watch-later-folders`,
      );
      setWatchLaterFolders(res.results || []);
    } catch (err) {
      console.error("Error fetching folders:", err);
    }
  };

  const filteredFolders = useMemo(() => {
    return watchLaterFolders.filter((f) =>
      f.folderName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [watchLaterFolders, searchQuery]);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/add-to-watch-later`,
        { folderName, folderStatus },
        { withCredentials: true },
      );
      setFolderName("");
      setShowCreateModal(false);
      fetchLatestFolders();
    } catch (err) {
      console.error("Error creating folder:", err);
    }
  };

  const handleUpdateFolder = async (e) => {
    e.preventDefault();
    if (!folderToUpdate.folderName?.trim()) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_SERVER_URL}/api/update-watch-later-folder`,
        {
          folderId: folderToUpdate.folderId,
          folderName: folderToUpdate.folderName,
          folderStatus: folderToUpdate.folderStatus,
        },
        { withCredentials: true },
      );
      setShowEditModal(false);
      fetchLatestFolders();
    } catch (err) {
      console.error("Error updating folder:", err);
    }
  };

  return (
    <div className="wl-container">
      <AiAssistant />
      <div className="wl-hero">
        <div className="wl-hero__content">
          <h2>My Watch Later Collections</h2>
          <p>Organize and manage your saved video collections in one place</p>
        </div>
        <button
          className="wl-btn wl-btn--large wl-btn--primary"
          onClick={() => setShowCreateModal(true)}
        >
          <IoMdAdd /> Create Folder
        </button>
      </div>

      {showCreateModal && (
        <div
          className="wl-modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="wl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wl-modal__header">
              <h3>New Folder</h3>
              <button
                className="wl-modal__close"
                onClick={() => setShowCreateModal(false)}
              >
                <IoMdClose />
              </button>
            </div>
            <form onSubmit={handleCreateFolder} className="wl-form">
              <div className="wl-form__group">
                <label>Folder Name</label>
                <input
                  type="text"
                  placeholder="Enter folder name..."
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  required
                />
              </div>
              <div className="wl-form__group">
                <label>Privacy Level</label>
                <select
                  value={folderStatus}
                  onChange={(e) => setFolderStatus(e.target.value)}
                >
                  {allFolderStatus.map((s) => (
                    <option key={s.id} value={s.status}>
                      {s.status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="wl-form__actions">
                <button type="submit" className="wl-btn wl-btn--primary">
                  Create
                </button>
                <button
                  type="button"
                  className="wl-btn wl-btn--secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="wl-toolbar">
        <div className="wl-search">
          <input
            type="text"
            placeholder="Search folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="wl-stats">
          <span className="wl-stats__item">
            {filteredFolders.length} folder
            {filteredFolders.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {filteredFolders.length === 0 ? (
        <div className="wl-empty">
          <div className="wl-empty__icon">
            <MdOutlineFolder />
          </div>
          <h3>No folders yet</h3>
          <p>Create your first collection to get started</p>
          <button
            className="wl-btn wl-btn--primary"
            onClick={() => setShowCreateModal(true)}
          >
            <IoMdAdd /> Create Folder
          </button>
        </div>
      ) : (
        <div className="wl-grid">
          {filteredFolders.map((folder) => (
            <div
              key={folder.folderId}
              className="wl-card"
              onClick={() => navigate(`/folders/${folder.folderId}`)}
            >
              <div className="wl-card__icon">
                <MdOutlineFolder />
              </div>
              <div className="wl-card__content">
                <h4>{folder.folderName}</h4>
                <div className="wl-card__meta">
                  <span className="wl-badge">{folder.folderStatus}</span>
                  <span className="wl-date">
                    {new Date(folder.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <button
                className="wl-card__action"
                onClick={(e) => {
                  e.stopPropagation();
                  setFolderToUpdate(folder);
                  setShowEditModal(true);
                }}
                title="Edit folder"
              >
                <IoMdSettings />
              </button>
            </div>
          ))}
        </div>
      )}

      {showEditModal && (
        <div
          className="wl-modal-overlay"
          onClick={() => setShowEditModal(false)}
        >
          <div className="wl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wl-modal__header">
              <h3>Edit Folder</h3>
              <button
                className="wl-modal__close"
                onClick={() => setShowEditModal(false)}
              >
                <IoMdClose />
              </button>
            </div>
            <form onSubmit={handleUpdateFolder} className="wl-form">
              <div className="wl-form__group">
                <label>Folder Name</label>
                <input
                  type="text"
                  placeholder="Enter folder name..."
                  value={folderToUpdate.folderName || ""}
                  onChange={(e) =>
                    setFolderToUpdate((prev) => ({
                      ...prev,
                      folderName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="wl-form__group">
                <label>Privacy Level</label>
                <select
                  value={folderToUpdate.folderStatus || "PUBLIC"}
                  onChange={(e) =>
                    setFolderToUpdate((prev) => ({
                      ...prev,
                      folderStatus: e.target.value,
                    }))
                  }
                >
                  {allFolderStatus.map((s) => (
                    <option key={s.id} value={s.status}>
                      {s.status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="wl-form__actions">
                <button type="submit" className="wl-btn wl-btn--primary">
                  Update
                </button>
                <button
                  type="button"
                  className="wl-btn wl-btn--secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchLater;
