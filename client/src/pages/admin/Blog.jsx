import { useEffect, useRef, useState } from "react";
import {
    FaEdit,
    FaFileAlt,
    FaImage,
    FaPlus,
    FaSpinner,
    FaTimes,
    FaTrash,
    FaUser,
} from "react-icons/fa";
import { API_BASE_URL } from "../../config/api";
import { uploadImageToCloudinary } from "../../utils/cloudinary";
import "./Blog.css";

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    author: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const contentRef = useRef(null);

  // Fetch all blogs
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/blogs`);
      const data = await response.json();
      if (data.success) {
        setBlogs(data.data);
      }
      setError(null);
    } catch (err) {
      setError("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title,
        content: blog.content,
        image: blog.image || "",
        author: blog.author || "",
      });
      setImagePreview(blog.image || "");
    } else {
      setEditingBlog(null);
      setFormData({
        title: "",
        content: "",
        image: "",
        author: "",
      });
      setImagePreview("");
    }
    setImageFile(null);
    setUploadStatus(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBlog(null);
    setFormData({
      title: "",
      content: "",
      image: "",
      author: "",
    });
    setImageFile(null);
    setImagePreview("");
    setUploadStatus(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Wrap selected text in the content textarea with ** ** for bold
  const handleBoldClick = () => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const value = formData.content || "";

    if (
      typeof selectionStart !== "number" ||
      typeof selectionEnd !== "number"
    ) {
      return;
    }

    const before = value.slice(0, selectionStart);
    const selected = value.slice(selectionStart, selectionEnd);
    const after = value.slice(selectionEnd);

    const wrapped = `**${selected || "bold text"}**`;
    const newValue = before + wrapped + after;

    setFormData((prev) => ({ ...prev, content: newValue }));

    const cursorPos = before.length + wrapped.length;
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadStatus({ type: "error", message: "Image must be less than 5MB" });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setUploadStatus(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image: "" }));
    setUploadStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = formData.image;

      // Upload new image if selected
      if (imageFile) {
        setUploadStatus({ type: "uploading", message: "Uploading image..." });
        try {
          imageUrl = await uploadImageToCloudinary(imageFile);
          setUploadStatus({ type: "success", message: "Image uploaded successfully!" });
        } catch (uploadError) {
          setUploadStatus({ type: "error", message: uploadError.message });
          setSubmitting(false);
          return;
        }
      }

      const blogData = {
        title: formData.title,
        content: formData.content,
        image: imageUrl,
        author: formData.author,
      };

      const token = localStorage.getItem("token");
      const editId = editingBlog && (editingBlog._id ?? editingBlog.id);
      const url = editId
        ? `${API_BASE_URL}/blogs/${editId}`
        : `${API_BASE_URL}/blogs`;
      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(blogData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchBlogs();
        handleCloseForm();
      } else {
        setUploadStatus({ type: "error", message: data.message || "Failed to save blog" });
      }
    } catch (err) {
      setUploadStatus({ type: "error", message: "An error occurred while saving the blog" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        await fetchBlogs();
      } else {
        alert(data.message || "Failed to delete blog");
      }
    } catch (err) {
      alert("An error occurred while deleting the blog");
    }
  };

  return (
    <div className="blog-page">
      <div className="blog-header">
        <h2>Blog Management</h2>
        <button className="blog-create-btn" onClick={() => handleOpenForm()}>
          <FaPlus /> Create New Post
        </button>
      </div>

      {loading && (
        <div className="blog-loading">
          <FaSpinner className="blog-loading-spinner" />
          <p>Loading blogs...</p>
        </div>
      )}

      {error && <div className="blog-error">{error}</div>}

      {!loading && !error && blogs.length === 0 && (
        <div className="blog-empty">
          <FaFileAlt />
          <h3>No blog posts yet</h3>
          <p>Create your first blog post to get started</p>
        </div>
      )}

      {!loading && !error && blogs.length > 0 && (
        <div className="blog-list">
          {blogs.map((blog) => {
            const blogId = blog._id ?? blog.id;
            return (
              <div key={blogId} className="blog-card">
                {blog.image ? (
                  <img src={blog.image} alt={blog.title} className="blog-card-image" />
                ) : (
                  <div className="blog-card-image" />
                )}
                <div className="blog-card-content">
                  <h3 className="blog-card-title">{blog.title}</h3>
                  <p className="blog-card-excerpt">{blog.content}</p>
                  <div className="blog-card-footer">
                    <span className="blog-card-author">
                      <FaUser /> {blog.author || "Admin"}
                    </span>
                    <div className="blog-card-actions">
                      <button
                        type="button"
                        className="edit-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenForm(blog);
                        }}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (blogId) handleDelete(blogId);
                        }}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="blog-form-modal">
          <div className="blog-form-container">
            <div className="blog-form-header">
              <h3>{editingBlog ? "Edit Blog Post" : "Create New Blog Post"}</h3>
              <button className="close-modal-btn" onClick={handleCloseForm}>
                <FaTimes />
              </button>
            </div>

            <form className="blog-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter blog title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="author">Author Name</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Enter author name (optional)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Content *</label>
                <div className="blog-toolbar">
                  <button
                    type="button"
                    className="blog-toolbar-btn"
                    onClick={handleBoldClick}
                    title="Bold (wrap selection with ** **)"
                  >
                    <strong>B</strong>
                  </button>
                </div>
                <textarea
                  id="content"
                  name="content"
                  ref={contentRef}
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Use **bold** around words you want to highlight"
                  required
                />
              </div>

              <div className="form-group">
                <label>Featured Image</label>
                <div className="image-upload-section">
                  {!imagePreview && (
                    <label className="image-upload-btn">
                      <FaImage />
                      <span>Choose Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </label>
                  )}

                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={handleRemoveImage}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}

                  {uploadStatus && (
                    <div className={`upload-status ${uploadStatus.type}`}>
                      {uploadStatus.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseForm}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submitting || uploading}
                >
                  {submitting ? "Saving..." : editingBlog ? "Update Post" : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
