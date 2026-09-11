import { useEffect, useState } from "react";
import { FaPlay, FaCalendarAlt, FaYoutube } from "react-icons/fa";
import { API_BASE_URL } from "../config/api";
import "./Sessions.css";

export default function Sessions() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
    fetchEvents();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/videos`);
      const data = await response.json();
      if (data.success) {
        setVideos(data.data);
      }
    } catch (err) {
      console.error("Failed to load videos:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`);
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setEventsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleWatchVideo = (youtubeUrl) => {
    window.open(youtubeUrl, "_blank", "noopener,noreferrer");
  };

  const handleOpenEvent = (eventUrl) => {
    window.open(eventUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="sessions-page">
      {/* Past Sessions */}
      <section className="sessions-section">
        <h3 className="section-title">
          <FaPlay /> Past Sessions & Recordings
        </h3>

        {loading && (
          <div className="sessions-loading">
            <div className="sessions-spinner"></div>
            <p>Loading sessions...</p>
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div className="sessions-empty">
            <FaYoutube />
            <p>No session recordings available yet.</p>
          </div>
        )}

        {!loading && videos.length > 0 && (
          <div className="recordings-grid">
            {videos.map((video) => (
              <div className="recording-card" key={video._id}>
                <div className="thumbnail" onClick={() => handleWatchVideo(video.youtubeUrl)}>
                  <img src={video.thumbnailUrl} alt={video.title} />
                  <div className="play-overlay">
                    <FaYoutube className="youtube-play-icon" />
                  </div>
                </div>
                <div className="recording-content">
                  <h4>{video.title}</h4>
                  {video.description && <p className="video-description">{video.description}</p>}
                  <span className="date">{formatDate(video.createdAt)}</span>

                  <button className="watch-btn" onClick={() => handleWatchVideo(video.youtubeUrl)}>
                    <FaPlay /> Watch on YouTube
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Available Slots */}
      <section className="sessions-section">
        <h3 className="section-title">
          <FaCalendarAlt /> Available Time Slots
        </h3>

        {eventsLoading && (
          <div className="sessions-loading">
            <div className="sessions-spinner"></div>
            <p>Loading events...</p>
          </div>
        )}

        {!eventsLoading && events.length === 0 && (
          <div className="sessions-empty">
            <FaCalendarAlt />
            <p>No upcoming events yet.</p>
          </div>
        )}

        {!eventsLoading && events.length > 0 && (
          <div className="slots-grid">
            {events.map((eventItem) => (
              <div
                className="slot-card"
                key={eventItem._id}
                onClick={() => handleOpenEvent(eventItem.eventUrl)}
              >
                <p className="slot-date">
                  {eventItem.createdAt
                    ? formatDate(eventItem.createdAt)
                    : "New Event"}
                </p>
                <p className="slot-time">{eventItem.title}</p>
                {eventItem.description && (
                  <p className="slot-name">{eventItem.description}</p>
                )}

                <button className="book-btn">View Event</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
