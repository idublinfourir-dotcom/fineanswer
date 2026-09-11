// Cloudinary upload utility
export const uploadImageToCloudinary = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Validate environment variables
  if (!cloudName) {
    throw new Error('Cloudinary cloud name is not configured. Please check your .env.local file.');
  }

  if (!uploadPreset) {
    throw new Error('Cloudinary upload preset is not configured. Please check your .env.local file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('cloud_name', cloudName);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Image upload failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.secure_url) {
      throw new Error('Upload successful but no image URL returned');
    }

    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Re-throw with a user-friendly message
    if (error.message) {
      throw error;
    }
    throw new Error('Failed to upload image. Please try again.');
  }
};

// Upload PDF/document to Cloudinary - raw/upload for documents
export const uploadDocumentToCloudinary = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName) {
    throw new Error('Cloudinary cloud name is not configured.');
  }

  if (!uploadPreset) {
    throw new Error('Cloudinary upload preset is not configured.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('cloud_name', cloudName);
  formData.append('resource_type', 'auto');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Document upload failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.secure_url) {
      throw new Error('Upload successful but no document URL returned');
    }

    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary document upload error:', error);
    if (error.message) {
      throw error;
    }
    throw new Error('Failed to upload document. Please try again.');
  }
};
