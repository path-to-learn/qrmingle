import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadVideo } from "@/lib/video";

interface VideoUploaderProps {
  onVideoUploaded: (videoUrl: string) => void;
  className?: string;
}

export function VideoUploader({ onVideoUploaded, className = "" }: VideoUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) {
        await handleFileUpload(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a video file",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);
    
    try {
      // Upload to server
      const videoUrl = await uploadVideo(file);
      onVideoUploaded(videoUrl);
      setUploading(false);
      toast({
        title: "Video uploaded",
        description: "Your tutorial video has been uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const clearVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {!videoPreview ? (
        <div
          className={`relative border-2 ${
            dragging ? "border-primary" : "border-dashed border-gray-300"
          } rounded-lg p-6 flex flex-col items-center justify-center h-48 transition-colors`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
        >
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 mb-2">
            Drag and drop your tutorial video here, or click to browse
          </p>
          <p className="text-xs text-gray-400 mb-2">
            Recommended: MP4 format, 720p (1280x720) resolution, max 50MB
          </p>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Select Video"}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="video/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-auto"
            src={videoPreview}
            onEnded={() => setIsPlaying(false)}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={clearVideo}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}