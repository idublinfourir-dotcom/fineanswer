// API service for Progress Tracker
import { API_BASE_URL } from "../config/api";

// Helper function to parse JSON response or handle HTML errors
const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    if (response.status === 404) {
      throw new Error('Backend endpoint not found. Please ensure the server has the progress tracker route implemented.');
    }
    throw new Error(`Server returned ${response.status} ${response.statusText}. Expected JSON but received ${contentType}`);
  }
  
  return await response.json();
};

// Get progress tracker for a specific user (admin only)
export const getUserProgressTracker = async (userId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/progress-tracker`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User or progress tracker not found');
      }
      const errorData = await parseResponse(response).catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch progress tracker: ${response.status} ${response.statusText}`);
    }

    const data = await parseResponse(response);
    return data;
  } catch (error) {
    console.error('Error fetching progress tracker:', error);
    throw error;
  }
};

// Get current user's progress tracker (for normal users)
export const getMyProgressTracker = async (token) => {
  try {
    console.log('🔍 Fetching progress tracker from:', `${API_BASE_URL}/users/me/progress-tracker`);
    
    const response = await fetch(`${API_BASE_URL}/users/me/progress-tracker`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      if (response.status === 404) {
        // No tracker exists yet, return empty array
        console.log('ℹ️ No tracker found (404) - returning empty array');
        return { timeline: [] };
      }
      
      // Handle 403 Forbidden - backend permission issue
      if (response.status === 403) {
        const errorData = await parseResponse(response).catch(() => ({}));
        console.error('❌ BACKEND PERMISSION ERROR (403):', errorData.message || 'Access denied');
        console.error('⚠️ The backend endpoint /api/users/me/progress-tracker is still requiring admin privileges.');
        console.error('⚠️ Please check your backend route - it should ONLY use authenticateToken, NOT requireAdmin');
        // Return empty array instead of throwing - allows UI to show "no data" message
        return { timeline: [] };
      }
      
      const errorData = await parseResponse(response).catch(() => ({}));
      console.error('❌ Error response:', errorData);
      throw new Error(errorData.message || `Failed to fetch progress tracker: ${response.status} ${response.statusText}`);
    }

    const data = await parseResponse(response);
    console.log('✅ Successfully fetched tracker data:', data);
    return data;
  } catch (error) {
    // If it's a network error or other issue, log but don't break the UI
    console.error('❌ Error fetching progress tracker:', error);
    // Return empty array to allow UI to render gracefully
    return { timeline: [] };
  }
};
// Update progress tracker for a specific user (admin only)
export const updateUserProgressTracker = async (userId, timeline, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/progress-tracker`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ timeline }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found');
      }
      const errorData = await parseResponse(response).catch(() => ({}));
      throw new Error(errorData.message || `Failed to update progress tracker: ${response.status} ${response.statusText}`);
    }

    const data = await parseResponse(response);
    return data;
  } catch (error) {
    console.error('Error updating progress tracker:', error);
    throw error;
  }
};
