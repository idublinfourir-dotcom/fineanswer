import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "../styles/blogdetails.css";

const renderRichContent = (content) => {
  if (!content) {
    return { __html: "" };
  }

  // Escape basic HTML entities to avoid arbitrary HTML injection
  let safe = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Convert **bold** markdown to <strong>bold</strong>
  safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Split into paragraphs by blank lines, keep single newlines as <br />
  const paragraphs = safe
    .split(/\n{2,}/)
    .map(
      (block) =>
        `<p>${block
          .split(/\n/)
          .map((line) => line.trim())
          .filter(Boolean)
          .join("<br />")}</p>`,
    )
    .join("");

  return { __html: paragraphs };
};

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/blogs/${id}`);
      const data = await response.json();

      if (data.success) {
        setBlog(data.data);
      } else {
        setError(data.message || "Blog not found");
      }
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError("Failed to load blog article");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-loading">
          <div className="loading-spinner"></div>
          <p>Loading article...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !blog) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-error">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>{error || "Blog article not found"}</p>
          <Link to="/blog" className="error-back-btn">
            <span>←</span> Back to All Articles
          </Link>
        </div>
      </div>
    );
  }

  // Main Content
  return (
    <div className="blog-detail-page">
      {/* Navigation */}
      <nav className="blog-detail-nav">
        <div className="blog-detail-nav-container">
          <Link to="/blog" className="blog-detail-back">
            <span className="back-arrow">←</span>
            <span>All Articles</span>
          </Link>
        </div>
      </nav>

      {/* Article Container */}
      <article className="blog-detail-article">
        {/* Header Section */}
        <header className="blog-detail-header">
          <div className="blog-detail-meta">
            <time className="blog-detail-date" dateTime={blog.createdAt}>
              {formatDate(blog.createdAt)}
            </time>
            {blog.author && (
              <>
                <span className="meta-separator">•</span>
                <span className="blog-detail-author">{blog.author}</span>
              </>
            )}
            {blog.readTime && (
              <>
                <span className="meta-separator">•</span>
                <span className="blog-detail-readtime">{blog.readTime} min read</span>
              </>
            )}
          </div>
          <h1 className="blog-detail-title">{blog.title}</h1>
        </header>

        {/* Featured Image */}
        {blog.image && (
          <div className="blog-detail-image-container">
            <img
              src={blog.image}
              alt={blog.title}
              className="blog-detail-image"
            />
          </div>
        )}

        {/* Content Section */}
        <div className="blog-detail-content">
          <div
            className="blog-detail-body"
            dangerouslySetInnerHTML={renderRichContent(blog.content)}
          />
        </div>

        {/* Footer Section */}
        
      </article>
    </div>
  );
}
