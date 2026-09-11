import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaSpinner } from "react-icons/fa";
import SuccessStoryForm from "../../components/admin/SuccessStoryForm";
import { getSuccessStories, deleteSuccessStory } from "../../services/successStoriesApi";
import "./SuccessStories.css";

export default function SuccessStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const data = await getSuccessStories();
      setStories(data.stories || data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load success stories");
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleEdit = (e, story) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingStory(story);
    setIsFormOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this success story?")) {
      return;
    }

    try {
      setDeleting(id);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      await deleteSuccessStory(id, token);
      await fetchStories();
    } catch (err) {
      alert(err.message || "Failed to delete success story");
    } finally {
      setDeleting(null);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingStory(null);
  };

  return (
    <div className="admin-success-stories">
      <div className="page-header">
        <div>
          <h2>Success Stories</h2>
          <p>Manage success stories that appear on the landing page</p>
        </div>
        <button
          className="btn-create"
          onClick={() => {
            setEditingStory(null);
            setIsFormOpen(true);
          }}
        >
          <FaPlus /> Create New Story
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading stories...</p>
        </div>
      ) : stories.length === 0 ? (
        <div className="empty-state">
          <p>No success stories yet. Create your first story!</p>
        </div>
      ) : (
        <div className="stories-grid">
          {stories.map((story) => {
            const storyId = story._id || story.id;
            return (
              <div key={storyId} className="admin-story-card">
                <div className="admin-story-image">
                  <img src={story.image} alt={story.name || "Success story"} />
                </div>
                <div className="admin-story-content">
                  <h3>{story.name}</h3>
                  <p className="admin-story-university">{story.university}</p>
                  <p className="admin-story-country">{story.country}</p>
                  <p className="admin-story-program">{story.program}</p>
                  <p className="admin-story-text">{story.story}</p>
                </div>
                <div className="admin-story-actions">
                  <button
                    type="button"
                    className="admin-btn-edit"
                    onClick={(e) => handleEdit(e, story)}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    type="button"
                    className="admin-btn-delete"
                    onClick={(e) => handleDelete(e, storyId)}
                    disabled={deleting === storyId}
                    title="Delete"
                  >
                    {deleting === storyId ? (
                      <FaSpinner className="spinner" />
                    ) : (
                      <FaTrash />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SuccessStoryForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSuccess={() => {
          fetchStories();
          setEditingStory(null);
        }}
        initialStory={editingStory}
      />
    </div>
  );
}
