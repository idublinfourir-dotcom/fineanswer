import { useState, useEffect } from "react";
import { FaPlus, FaTimes, FaEdit, FaTrash, FaYoutube, FaSpinner, FaCalendarAlt } from "react-icons/fa";
import { API_BASE_URL } from "../../config/api";
import "./AdminSession.css";

export default function AdminSession() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventSubmitting, setEventSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    youtubeUrl: "",
    description: "",
  });

  const [eventFormData, setEventFormData] = useState({
    title: "",
    eventUrl: "",
    description: "",
  });

  useEffect(() => {
    fetchVideos();
    fetchEvents();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/videos`);
      const data = await response.json();
      if (data.success) {
        setVideos(data.data);
      }
      setError(null);
    } catch (err) {
      setError("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const response = await fetch(`${API_BASE_URL}/events`);
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      }
      setEventsError(null);
    } catch (_err) {
      setEventsError("Failed to load events");
    } finally {
      setEventsLoading(false);
    }
  };

  const handleOpenForm = (video = null) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        title: video.title,
        youtubeUrl: video.youtubeUrl,
        description: video.description || "",
      });
    } else {
      setEditingVideo(null);
      setFormData({
        title: "",
        youtubeUrl: "",
        description: "",
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVideo(null);
    setFormData({
      title: "",
      youtubeUrl: "",
      description: "",
    });
  };

  const handleOpenEventForm = (eventItem = null) => {
    if (eventItem) {
      setEditingEvent(eventItem);
      setEventFormData({
        title: eventItem.title,
        eventUrl: eventItem.eventUrl,
        description: eventItem.description || "",
      });
    } else {
      setEditingEvent(null);
      setEventFormData({
        title: "",
        eventUrl: "",
        description: "",
      });
    }
    setShowEventForm(true);
  };

  const handleCloseEventForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    setEventFormData({
      title: "",
      eventUrl: "",
      description: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setEventFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = editingVideo
        ? `${API_BASE_URL}/videos/${editingVideo._id}`
        : `${API_BASE_URL}/videos`;
      const method = editingVideo ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchVideos();
        handleCloseForm();
      } else {
        alert(data.message || "Failed to save video");
      }
    } catch (err) {
      alert("An error occurred while saving the video");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        await fetchVideos();
      } else {
        alert(data.message || "Failed to delete video");
      }
    } catch (err) {
      alert("An error occurred while deleting the video");
    }
  };

  const handleWatchVideo = (youtubeUrl) => {
    window.open(youtubeUrl, "_blank", "noopener,noreferrer");
  };

  const handleOpenEvent = (eventUrl) => {
    window.open(eventUrl, "_blank", "noopener,noreferrer");
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setEventSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = editingEvent
        ? `${API_BASE_URL}/events/${editingEvent._id}`
        : `${API_BASE_URL}/events`;
      const method = editingEvent ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventFormData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchEvents();
        handleCloseEventForm();
      } else {
        alert(data.message || "Failed to save event");
      }
    } catch (_err) {
      alert("An error occurred while saving the event");
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleEventDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        await fetchEvents();
      } else {
        alert(data.message || "Failed to delete event");
      }
    } catch (_err) {
      alert("An error occurred while deleting the event");
    }
  };

  return (
    <div className="admin-session-page">
      <div className="admin-session-header">
        <h2>Session Videos</h2>
        <button className="add-video-btn" onClick={() => handleOpenForm()}>
          <FaPlus /> Add YouTube Video
        </button>
      </div>

      {loading && (
        <div className="video-loading">
          <FaSpinner className="spinner" />
          <p>Loading videos...</p>
        </div>
      )}

      {error && <div className="video-error">{error}</div>}

      {!loading && !error && videos.length === 0 && (
        <div className="video-empty">
          <FaYoutube />
          <h3>No videos yet</h3>
          <p>Add your first YouTube video to get started</p>
        </div>
      )}

      {!loading && !error && videos.length > 0 && (
        <div className="video-grid">
          {videos.map((video) => (
            <div key={video._id} className="video-card" onClick={() => handleWatchVideo(video.youtubeUrl)}>
              <div className="video-thumbnail-wrapper">
                <img src={video.thumbnailUrl} alt={video.title} />
                <div className="video-overlay">
                  <FaYoutube className="youtube-icon" />
                </div>
              </div>
              <div className="video-card-content">
                <h3>{video.title}</h3>
                {video.description && <p>{video.description}</p>}
                <div className="video-card-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="edit-video-btn"
                    onClick={() => handleOpenForm(video)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="delete-video-btn"
                    onClick={() => handleDelete(video._id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-session-header admin-session-header--events">
        <h2>Available Time Slot Events</h2>
        <button className="add-video-btn" onClick={() => handleOpenEventForm()}>
          <FaPlus /> Add Event Link
        </button>
      </div>

      {eventsLoading && (
        <div className="video-loading">
          <FaSpinner className="spinner" />
          <p>Loading events...</p>
        </div>
      )}

      {eventsError && <div className="video-error">{eventsError}</div>}

      {!eventsLoading && !eventsError && events.length === 0 && (
        <div className="video-empty">
          <FaCalendarAlt />
          <h3>No events yet</h3>
          <p>Add your first event link to get started</p>
        </div>
      )}

      {!eventsLoading && !eventsError && events.length > 0 && (
        <div className="video-grid">
          {events.map((eventItem) => (
            <div
              key={eventItem._id}
              className="video-card"
              onClick={() => handleOpenEvent(eventItem.eventUrl)}
            >
              <div className="video-card-content">
                <h3>{eventItem.title}</h3>
                {eventItem.description && <p>{eventItem.description}</p>}
                <div
                  className="video-card-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="edit-video-btn"
                    onClick={() => handleOpenEventForm(eventItem)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="delete-video-btn"
                    onClick={() => handleEventDelete(eventItem._id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="video-form-modal">
          <div className="video-form-container">
            <div className="video-form-header">
              <h3>{editingVideo ? "Edit Video" : "Add YouTube Video"}</h3>
              <button className="close-modal-btn" onClick={handleCloseForm}>
                <FaTimes />
              </button>
            </div>

            <form className="video-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Video Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., SOP Writing Workshop"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="youtubeUrl">YouTube URL *</label>
                <input
                  type="url"
                  id="youtubeUrl"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleInputChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
                <small className="form-hint">
                  Supports: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description about the video (optional)"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseForm}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? "Saving..." : editingVideo ? "Update Video" : "Add Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEventForm && (
        <div className="video-form-modal">
          <div className="video-form-container">
            <div className="video-form-header">
              <h3>{editingEvent ? "Edit Event" : "Add Event Link"}</h3>
              <button className="close-modal-btn" onClick={handleCloseEventForm}>
                <FaTimes />
              </button>
            </div>

            <form className="video-form" onSubmit={handleEventSubmit}>
              <div className="form-group">
                <label htmlFor="eventTitle">Event Title *</label>
                <input
                  type="text"
                  id="eventTitle"
                  name="title"
                  value={eventFormData.title}
                  onChange={handleEventInputChange}
                  placeholder="e.g., Live Q&A on Irish Universities"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="eventUrl">Event Link (Facebook, Zoom, etc.) *</label>
                <input
                  type="url"
                  id="eventUrl"
                  name="eventUrl"
                  value={eventFormData.eventUrl}
                  onChange={handleEventInputChange}
                  placeholder="https://www.facebook.com/events/..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="eventDescription">Description</label>
                <textarea
                  id="eventDescription"
                  name="description"
                  value={eventFormData.description}
                  onChange={handleEventInputChange}
                  placeholder="Short description about the event (optional)"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseEventForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={eventSubmitting}
                >
                  {eventSubmitting
                    ? "Saving..."
                    : editingEvent
                    ? "Update Event"
                    : "Add Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
