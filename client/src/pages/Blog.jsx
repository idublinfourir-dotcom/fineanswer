import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "../styles/Blog.css";

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs`);
      const data = await response.json();
      if (data.success) {
        setBlogs(data.data);
      } else {
        setError("Failed to load blogs");
      }
    } catch (err) {
      console.error("Failed to load blogs:", err);
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const stripMarkdownBold = (text) =>
    text ? text.replace(/\*\*(.+?)\*\*/g, "$1") : "";

  const truncateContent = (content, maxLength = 120) => {
    if (!content) return "No preview available...";
    const plain = stripMarkdownBold(content);
    return plain.length > maxLength
      ? plain.substring(0, maxLength) + "..."
      : plain;
  };

  if (loading) {
    return (
      <div className="blog-page">
        <div className="blog-loader">Loading articles</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-page">
        <div className="blog-nav-container">
          <button className="blog-back-btn" onClick={() => navigate("/")}>
            <span className="arrow">←</span> Back to Home
          </button>
        </div>
        <div className="blog-empty">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page">
      {/* Navigation Layer */}
      <div className="blog-nav-container">
        <button className="blog-back-btn" onClick={() => navigate("/")}>
          <span className="arrow">←</span> Back to Home
        </button>
      </div>

      {/* Header Section */}
      <header className="blog-header">
        <h1>Blog Articles</h1>
        <p>
          Stay informed and inspired with our blog, featuring insightful
          articles, expert perspectives, and the latest updates on topics that matter.
        </p>
      </header>

      {/* Blog Grid */}
      <main className="blog-container">
        {blogs.length === 0 ? (
          <div className="blog-empty">
            <p>No articles published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="blog-grid">
            {blogs.map((blog) => (
              <article className="blog-card" key={blog._id}>
                <div className="blog-card-image">
                  {blog.image ? (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className="blog-placeholder" />
                  )}
                </div>
                <div className="blog-card-content">
                  <time className="blog-date" dateTime={blog.createdAt}>
                    {formatDate(blog.createdAt)}
                  </time>
                  <h2 className="blog-title">{blog.title}</h2>
                  <p className="blog-excerpt">
                    {truncateContent(blog.content)}
                  </p>
                  <Link
                    to={`/blog/${blog._id}`}
                    className="blog-read-more"
                    aria-label={`Read more about ${blog.title}`}
                  >
                    <span>Read More</span>
                    <span className="read-arrow">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
