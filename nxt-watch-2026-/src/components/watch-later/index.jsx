import "./index.css";
import { useNavigate } from "react-router-dom";
import { IoMdAdd } from "react-icons/io";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { IoMdSettings } from "react-icons/io";
import fetchWatchLaterFolders from "../../../fetch-all-watch-later-folders";
import "./index.css";

const allFolderStatus = [
  { id: 1, status: "PUBLIC" },
  { id: 2, status: "PRIVATE" },
];

const WatchLater = () => {
  const [folderName, setFolderName] = useState("");
  const [folderStatus, setFolderStatus] = useState(allFolderStatus[0].status);
  const [addWatchLater, setAddWatchLater] = useState(false);
  const [watchLaterFolders, setWatchLaterFolders] = useState([]);
  const [folderToUpdate, setFolderToUpdate] = useState({});
  const [updatingMode, setUpdatingMode] = useState(false);
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    fetchLatestFolders();
  }, []);

  const fetchLatestFolders = async () => {
    const res = await fetchWatchLaterFolders();
    setWatchLaterFolders(res.r);
  };

  const fil = useMemo(() => {
    return watchLaterFolders.filter((f) =>
      f.folderName.toLowerCase().includes(input.toLowerCase()),
    );
  }, [watchLaterFolders, input]);

  const submitData = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/add-to-watch-later",
        {
          folderName,
          folderStatus,
        },
        {
          withCredentials: true,
        },
      );

      alert(res.data.message);
    } catch (err) {
      alert(err);
    }
  };

  const updateWatchLaterFolder = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        "http://localhost:5000/api/update-watch-later-folder",
        {
          folderId: folderToUpdate.folderId,
          folderName: folderToUpdate.folderName,
          folderStatus: folderToUpdate.folderStatus,
        },
        {
          withCredentials: true,
        },
      );
      console.log(res.data.message);
      fetchWatchLaterFolders();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="watch-later-page" onClick={() => updatingMode(false)}>
        <div
          style={{ marginLeft: "35px", marginRight: "30px" }}
          className="watch"
        >
          <h1>Watch Laters</h1>
          <div className="b">
            <button className="watch" style={{ marginRight: "20px" }}>
              <IoMdAdd
                onClick={() => setAddWatchLater((prev) => !prev)}
                className="add-icon"
              />
            </button>
            <button
              className="watch"
              onClick={() => navigate("/library/watch-later")}
            >
              Watch Later Lists
            </button>
          </div>
        </div>
        {addWatchLater && (
          <div>
            
              <div className="modal-overlay">
                <div className="modal-card">
                  <h2 className="modal-title">Create Watch Later Folder</h2>

                  <form onSubmit={submitData} className="modal-form">
                    <div className="form-group">
                      <label htmlFor="watch-later-folder-name">
                        Folder Name
                      </label>
                      <input
                        id="watch-later-folder-name"
                        type="text"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        placeholder="Enter folder name..."
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="watch-later-folder-status">
                        Folder Privacy
                      </label>
                      <select
                        onChange={(e) => setFolderStatus(e.target.value)}
                        value={folderStatus}
                        id="watch-later-folder-status"
                      >
                        {allFolderStatus.map((e) => (
                          <option key={e.id} value={e.status}>
                            {e.status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="primary-btn">
                        Create Folder
                      </button>
                      <button
                       type="button"
                        className="primary-btn"
                        onClick={() => updatingMode(false)}
                      >
                        cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            
          </div>
        )}

        <div className="delete-section">
          <input
            type="search"
            className="watch-hisory-search"
            placeholder="search..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="delete-full">Delete All</button>
        </div>
        <div className="all-folders">
          {fil.map((folder) => (
            <>
              <div
                onClick={() => navigate(`/folders/${folder.folderId}`)}
                className="watch-later-folder"
              >
                <div>
                  <h3>{folder.folderName}</h3>
                  <p className="stat">{folder.folderStatus}</p>
                </div>
                <div style={{ paddingTop: "43px" }}>
                  <IoMdSettings
                    onClick={(e) => {
                      e.stopPropagation();
                      setFolderToUpdate(folder);
                      setUpdatingMode(true);
                    }}
                    className="setting"
                  />
                  <p className="date">
                    {new Date(folder.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </>
          ))}
        </div>

        <div>
          {updatingMode && (
            <div className="modal-overlay">
              <div className="modal-card">
                <h2 className="modal-title">Update Folder</h2>

                <form onSubmit={updateWatchLaterFolder} className="modal-form">
                  <div className="form-group">
                    <label htmlFor="update-folder-name">Folder Name</label>
                    <input
                      id="update-folder-name"
                      type="text"
                      value={folderToUpdate.folderName || ""}
                      onChange={(e) =>
                        setFolderToUpdate((prev) => ({
                          ...prev,
                          folderName: e.target.value,
                        }))
                      }
                      placeholder="Enter folder name..."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="update-folder-status">Folder Privacy</label>
                    <select
                      id="update-folder-status"
                      value={folderToUpdate.folderStatus || ""}
                      onChange={(e) =>
                        setFolderToUpdate((prev) => ({
                          ...prev,
                          folderStatus: e.target.value,
                        }))
                      }
                    >
                      {allFolderStatus.map((e) => (
                        <option key={e.id} value={e.status}>
                          {e.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="primary-btn">
                      Update Folder
                    </button>

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => setUpdatingMode(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WatchLater;
