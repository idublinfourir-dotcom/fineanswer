import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { getSuccessStories } from "../services/successStoriesApi";
import { cldImg } from "../utils/cloudinary";
import { snippet, useSeo } from "../seo";
import { FaUniversity, FaMapMarkerAlt } from "react-icons/fa";
import "./SuccessStoryDetail.css";

export default function SuccessStoryDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [story, setStory] = useState(location.state?.story || null);
  const [loading, setLoading] = useState(!story);
  const [error, setError] = useState(null);

  useSeo(
    story && {
      title: `${story.name}: ${[story.program, story.university].filter(Boolean).join(" at ")} | FineAnswer Success Stories`,
      description: snippet(story.story),
      path: story._id ? `/success-story/${story._id}` : undefined,
      image: story.image || undefined,
    },
  );

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
        <img src={cldImg(story.image, 400)} alt={story.name} className="detail-avatar" />
        <h1>{story.name}</h1>
        <p className="meta"><FaUniversity /> {story.university}</p>
        <p className="meta"><FaMapMarkerAlt /> {story.country}</p>
        <p className="program">{story.program}</p>
        <div className="full-story">{story.story}</div>
        <Link to="/" className="back-link">← Back</Link>
      </div>
    </div>
  );
}
