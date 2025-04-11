import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VideoUploaderProps {
  onVideoUploaded: (videoUrl: string) => void;
  className?: string;
}

export function VideoUploader({ onVideoUploaded, className }: VideoUploaderProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setErrorMessage(null);
    
    if (!files || files.length === 0) {
      setSelectedFile(null);
      return;
    }
    
    const file = files[0];
    
    // Validate file type (accept any video format, prefer MP4)
    if (!file.type.startsWith('video/')) {
      setErrorMessage('Please select a video file. MP4 format is recommended.');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
    // Validate file size (limit to 50MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 50) {
      setErrorMessage('Video file is too large. Maximum size is 50MB.');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
    setSelectedFile(file);
  };

  const uploadVideo = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('video', selectedFile);
      
      // Send a POST request to the API
      const response = await fetch('/api/upload-tutorial-video', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        // Don't set Content-Type header, let the browser set it automatically with the boundary parameter
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload video');
      }
      
      const data = await response.json();
      
      // Handle the successful upload
      toast({
        title: 'Upload Successful',
        description: 'Your tutorial video has been uploaded.',
      });
      
      // Call the callback with the video URL
      if (data.videoUrl) {
        onVideoUploaded(data.videoUrl);
      }
      
      // Reset the state
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error uploading video:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload video');
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'There was an error uploading your video.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={cn("space-y-4", className)}>
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <input
          type="file"
          ref={fileInputRef}
          accept="video/mp4,video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        {!selectedFile ? (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Click to select a video file
            </p>
            <p className="text-xs text-gray-400 mt-1">
              MP4 format recommended, 720p (HD), max 50MB
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="mt-4"
              disabled={isUploading}
            >
              Select Video
            </Button>
          </div>
        ) : (
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {selectedFile.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelUpload}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 mb-2">
              Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </div>
            
            {isUploading ? (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-center text-gray-500">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  onClick={uploadVideo}
                  className="w-full"
                >
                  Upload Video
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}