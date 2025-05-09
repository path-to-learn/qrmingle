import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { StarIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { celebrateWithColors } from "@/lib/confetti";

interface ReviewSubmitFormProps {
  onSuccess?: () => void;
  className?: string;
}

export default function ReviewSubmitForm({ onSuccess, className = "" }: ReviewSubmitFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    content: "",
    rating: 5,
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/reviews", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit review");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you! Your review has been submitted and will be visible after approval.",
      });
      
      // Reset form
      setFormData({
        name: "",
        title: "",
        content: "",
        rating: 5,
      });
      
      // Invalidate reviews query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      
      // Call optional success callback
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit your review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your name.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please write a review comment.",
        variant: "destructive",
      });
      return;
    }
    
    reviewMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setRating = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Your Name*
        </label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="John Smith"
          required
        />
      </div>
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title/Position <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="CEO at TechCorp"
        />
      </div>
      
      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-1">
          Your Review*
        </label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          placeholder="Share your experience using QrMingle..."
          rows={4}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Rating*</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 focus:outline-none"
            >
              <StarIcon
                className={`h-6 w-6 ${
                  star <= formData.rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={reviewMutation.isPending}
      >
        {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
      </Button>
      
      <p className="text-xs text-muted-foreground text-center">
        Your review will be visible after approval by our team.
      </p>
    </form>
  );
}