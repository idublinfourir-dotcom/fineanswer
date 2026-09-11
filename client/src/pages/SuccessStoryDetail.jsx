import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { getSuccessStories } from "../services/successStoriesApi";
import { FaUniversity, FaMapMarkerAlt } from "react-icons/fa";
import "./SuccessStoryDetail.css";

export default function SuccessStoryDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [story, setStory] = useState(location.state?.story || null);
  const [loading, setLoading] = useState(!story);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (story) return;
    let mounted = true;
    (async () => {
      try {
        const data = await getSuccessStories();
        const raw = Array.isArray(data)
          ? data
          : data?.stories ?? data?.data ?? [];
        const found = raw.find((s, idx) => s._id === id || String(idx) === id);
        if (mounted) setStory(found || null);
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load story");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id, story]);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, color: "red" }}>{error}</div>;
  if (!story) return <div style={{ padding: 40 }}>Story not found.</div>;

  return (
    <div className="story-detail-wrapper">
      <div className="story-detail-card">
        <img src={story.image} alt={story.name} className="detail-avatar" />
        <h2>{story.name}</h2>
        <p className="meta"><FaUniversity /> {story.university}</p>
        <p className="meta"><FaMapMarkerAlt /> {story.country}</p>
        <p className="program">{story.program}</p>
        <div className="full-story">{story.story}</div>
        <Link to="/" className="back-link">← Back</Link>
      </div>
    </div>
  );
}
