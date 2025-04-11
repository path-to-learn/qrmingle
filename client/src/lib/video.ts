/**
 * Utility functions for handling video uploads and management
 */

/**
 * Checks if the current user is an admin
 * @returns boolean indicating if user is admin
 */
export function isAdmin(user: any): boolean {
  // Allow both 'admin' and 'demo' users to have admin privileges for testing
  return !!user && (user.username === 'admin' || user.username === 'demo');
}

/**
 * Upload a video file to the server (admin only)
 * @param file The file to upload
 * @returns URL of the uploaded video
 */
export async function uploadVideo(file: File): Promise<string> {
  // Check file type
  if (!file.type.startsWith('video/')) {
    throw new Error('File must be a video');
  }

  // Create form data
  const formData = new FormData();
  formData.append('video', file);

  try {
    // Send the video to the server
    const response = await fetch('/api/upload-tutorial-video', {
      method: 'POST',
      body: formData,
      credentials: 'include', // Include cookies for auth
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload video');
    }

    const data = await response.json();
    return data.videoUrl;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
}

/**
 * Fetches the current tutorial video URL
 * @returns URL of the current tutorial video or null if none exists
 */
export async function getTutorialVideo(): Promise<string | null> {
  try {
    const response = await fetch('/api/tutorial-video');
    
    if (!response.ok) {
      if (response.status === 404) {
        // No video found, not an error
        return null;
      }
      throw new Error('Failed to fetch tutorial video');
    }

    const data = await response.json();
    return data.videoUrl;
  } catch (error) {
    console.error('Error fetching tutorial video:', error);
    return null;
  }
}