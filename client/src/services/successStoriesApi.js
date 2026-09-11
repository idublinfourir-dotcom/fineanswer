// API service for Success Stories
import { API_BASE_URL } from "../config/api";

// Helper function to parse JSON response or handle HTML errors
const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    // Server returned HTML (likely a 404 page) instead of JSON
    if (response.status === 404) {
      throw new Error('Backend endpoint not found. Please ensure the server has the /api/success-stories route implemented.');
    }
    throw new Error(`Server returned ${response.status} ${response.statusText}. Expected JSON but received ${contentType}`);
  }
  
  return await response.json();
};

export const getSuccessStories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/success-stories`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Backend endpoint not found. Please ensure the server has the /api/success-stories route implemented.');
      }
      const errorData = await parseResponse(response).catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch success stories: ${response.status} ${response.statusText}`);
    }
    
    const data = await parseResponse(response);
    return data;
  } catch (error) {
    console.error('Error fetching success stories:', error);
    throw error;
  }
};

export const createSuccessStory = async (storyData, token) => {
  try {
    // storyData should contain: { name, university, country, program, story, image }
    const response = await fetch(`${API_BASE_URL}/success-stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(storyData),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Backend endpoint not found. Please ensure the server has the POST /api/success-stories route implemented.');
      }
      const errorData = await parseResponse(response).catch(() => ({}));
      throw new Error(errorData.message || `Failed to create success story: ${response.status} ${response.statusText}`);
    }

    const data = await parseResponse(response);
    return data;
  } catch (error) {
    console.error('Error creating success story:', error);
    // Re-throw with user-friendly message
    if (error.message.includes('Backend endpoint not found')) {
      throw error;
    }
    throw new Error(error.message || 'Failed to create success story. Please check your backend server.');
  }
};

export const updateSuccessStory = async (id, storyData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/success-stories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(storyData),
    });

    if (!response.ok) {
      const errorData = await parseResponse(response).catch(() => ({}));
      throw new Error(errorData.message || `Failed to update success story: ${response.status} ${response.statusText}`);
    }

    const data = await parseResponse(response);
    return data;
  } catch (error) {
    console.error('Error updating success story:', error);
    throw error;
  }
};

export const deleteSuccessStory = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/success-stories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Backend endpoint not found. Please ensure the server has the DELETE /api/success-stories/:id route implemented.');
      }
      const errorData = await parseResponse(response).catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete success story: ${response.status} ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting success story:', error);
    throw error;
  }
};
