import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaUniversity, FaMapMarkerAlt } from "react-icons/fa";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import "./SuccessStories.css";
import { getSuccessStories } from "../services/successStoriesApi";
import { cldImg } from "../utils/cloudinary";

export default function SuccessStories() {
  const [stories, setStories] = useState([]);
  const [active, setActive] = useState(0);
  const touchStart = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      const data = await getSuccessStories();
      const raw = Array.isArray(data) ? data : data?.stories ?? data?.data ?? [];
      setStories(raw || []);
    };
    fetch();
  }, []);

  // Autoplay; restarts whenever the active story changes so manual navigation gets a full 5s
  useEffect(() => {
    if (!stories.length) return;
    const id = setInterval(() => {
      setActive((p) => (p === stories.length - 1 ? 0 : p + 1));
    }, 5000);
    return () => clearInterval(id);
  }, [stories.length, active]);

  const prev = () => {
    setActive((p) => (p === 0 ? stories.length - 1 : p - 1));
  };

  const next = () => {
    setActive((p) => (p === stories.length - 1 ? 0 : p + 1));
  };

  // Swipe left/right on touch screens
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return; // a tap or a vertical scroll
    if (dx < 0) next();
    else prev();
  };

  if (!stories.length) return null;

  return (
    <div className="success-wrapper">
      <div className="success-header">
        <h2 className="success-title">Success Stories</h2>
        <p className="success-sub">Empowering students to achieve their global dreams</p>
      </div>

      <div className="carousel-container">
        {/* Modern Minimalist Buttons */}
        {/* Modern Minimalist Arrows */}
<button 
  className="control-btn prev" 
  onClick={prev} 
  aria-label="Previous Story"
>
  <FiArrowLeft />
</button>

<button 
  className="control-btn next" 
  onClick={next} 
  aria-label="Next Story"
>
  <FiArrowRight />
</button>

        <div
          className="carousel-track"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {stories.map((story, i) => {
            let offset = i - active;
            if (offset < -stories.length / 2) offset += stories.length;
            if (offset > stories.length / 2) offset -= stories.length;

            // Display more cards by increasing visibility range
            const isVisible = Math.abs(offset) <= 2.5; 
            const isActive = offset === 0;

            return (
              <div
                key={i}
                className={`story-card-wrapper ${isActive ? "active" : ""}`}
                style={{
                  transform: `translateX(calc(-50% + ${offset * 320}px)) scale(${isActive ? 1 : 0.85})`,
                  opacity: isActive ? 1 : isVisible ? 0.4 : 0,
                  zIndex: 10 - Math.abs(offset),
                  transition: isVisible ? "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
                  pointerEvents: isActive ? "all" : "none"
                }}
              >
                <div className="story-card">
                  <div className="user-profile">
                    <img src={cldImg(story.image, 200)} alt={story.name} className="user-avatar" loading="lazy" />
                  </div>
                  
                  <div className="card-content">
                    <h3 className="user-name">{story.name}</h3>
                    <span className="user-program">{story.program}</span>

                    <div className="user-meta">
                      <span><FaUniversity /> {story.university}</span>
                      <span><FaMapMarkerAlt /> {story.country}</span>
                    </div>

                    <p className="user-quote">"{story.story}"</p>

                    <Link to={`/success-story/${story._id || i}`} className="action-link">
                      Read Full Story
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}