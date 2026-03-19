import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Review } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ReviewCard from "@/components/reviews/ReviewCard";
import ReviewSubmitForm from "@/components/reviews/ReviewSubmitForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Star } from "lucide-react";

export default function ReviewsPage() {
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  
  // Fetch reviews from the API
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Reviews</h1>
          <p className="text-muted-foreground">See what others are saying about QrMingle</p>
        </div>
        <Dialog open={reviewFormOpen} onOpenChange={setReviewFormOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Your Review
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Your Experience</DialogTitle>
              <DialogDescription>
                Tell others about your experience with QrMingle
              </DialogDescription>
            </DialogHeader>
            <ReviewSubmitForm 
              onSuccess={() => setReviewFormOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">{reviews.length}</div>
          <div className="text-sm text-muted-foreground">Total Reviews</div>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
            <span className="text-2xl font-bold">
              {reviews.length > 0
                ? (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1)
                : "0.0"}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">Average Rating</div>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">
            {Math.round((reviews.filter(review => (review.rating || 0) >= 4).length / Math.max(reviews.length, 1)) * 100)}%
          </div>
          <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
        </Card>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse bg-muted/30 rounded-lg"></div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} className="hover:shadow-md transition-shadow" />
          ))
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">No reviews available yet.</p>
            <p className="text-muted-foreground">Be the first to share your experience!</p>
            <Button onClick={() => setReviewFormOpen(true)} className="mt-4">
              Add Review
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}