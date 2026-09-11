import { useEffect, useState } from "react";
import { FaArrowRight, FaCalendar, FaNewspaper, FaUser } from "react-icons/fa";
import { API_BASE_URL } from "../config/api";
import "./BlogSection.css";

export default function BlogSection() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs`);
      const data = await response.json();
      if (data.success) {
        // Show only the latest 3 blogs
        setBlogs(data.data.slice(0, 3));
      }
    } catch (err) {
      console.error("Failed to load blogs:", err);
    } finally {
      setLoading(false);
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

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  if (loading) {
    return (
      <section className="blog-section">
        <div className="blog-container">
          <div className="blog-section-header">
            <h2>Latest Insights</h2>
            <p>Stay updated with our latest news and articles</p>
          </div>
          <div className="blog-loading-state">
            <div className="spinner"></div>
            <p>Loading blogs...</p>
          </div>
        </div>
      </section>
    );
  }

  if (blogs.length === 0) {
    return null; // Don't show section if no blogs
  }

  return (
    <section className="blog-section">
      <div className="blog-container">
        <div className="blog-section-header">
          <div className="header-left">
            <FaNewspaper className="header-icon" />
            <div>
              <h2>Latest Insights</h2>
              <p>Stay updated with our latest news and articles</p>
            </div>
          </div>
        </div>

        <div className="blog-grid">
          {blogs.map((blog) => (
            <article key={blog._id} className="blog-item">
              <div className="blog-image-wrapper">
                {blog.image ? (
                  <img src={blog.image} alt={blog.title} className="blog-image" />
                ) : (
                  <div className="blog-image-placeholder">
                    <FaNewspaper />
                  </div>
                )}
              </div>

              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-date">
                    <FaCalendar /> {formatDate(blog.createdAt)}
                  </span>
                  <span className="blog-author">
                    <FaUser /> {blog.author || "Admin"}
                  </span>
                </div>

                <h3 className="blog-title">{blog.title}</h3>
                <p className="blog-excerpt">{truncateText(blog.content, 120)}</p>

                <button className="blog-read-more">
                  Read Moree <FaArrowRight />
                </button>
              </div>
            </article>
          ))}
        </div>

        {blogs.length >= 3 && (
          <div className="blog-view-all">
            <button className="view-all-btn">
              View All Articles <FaArrowRight />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
