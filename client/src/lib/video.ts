/**
 * Utility functions for handling video uploads and management
 */

/**
 * Upload a video file to the server
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
    });

    if (!response.ok) {
      throw new Error('Failed to upload video');
    }

    const data = await response.json();
    return data.videoUrl;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
}