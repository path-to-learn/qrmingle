import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Review } from "@shared/schema";
import ReviewCard from "./ReviewCard";
import ReviewSubmitForm from "./ReviewSubmitForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ReviewsSectionProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function ReviewsSection({ className = "", style }: ReviewsSectionProps) {
  const [page, setPage] = useState(0);
  const reviewsPerPage = 2;

  // Sample reviews - in a real app, these would come from the API
  // Since we don't have a backend endpoint yet, we're using this sample data
  const sampleReviews: Review[] = [
    {
      id: 1,
      name: "John Smith",
      title: "CEO at TechCorp",
      content: "QrMingle has transformed how I network at conferences. The custom QR codes and beautiful profiles make sharing contact info effortless.",
      rating: 5,
      avatarUrl: null,
      isVisible: true,
      createdAt: new Date(),
    },
    {
      id: 2,
      name: "Alex Johnson",
      title: "Marketing Expert",
      content: "The customization options are fantastic! I love being able to match my profile to my personal brand.",
      rating: 5,
      avatarUrl: null,
      isVisible: true,
      createdAt: new Date(),
    },
    {
      id: 3,
      name: "Sarah Lee",
      title: "Event Organizer",
      content: "As an event organizer, QrMingle has been a game-changer for networking. Our attendees love the ease of connecting and sharing contact info.",
      rating: 4,
      avatarUrl: null,
      isVisible: true,
      createdAt: new Date(),
    },
    {
      id: 4,
      name: "Michael Chen",
      title: "Student",
      content: "I use QrMingle for sharing my resume and portfolio links at job fairs. So much better than paper business cards!",
      rating: 5,
      avatarUrl: null,
      isVisible: true,
      createdAt: new Date(),
    },
  ];

  // Fetch reviews from the API
  const { data: reviews = sampleReviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  const paginatedReviews = reviews.slice(
    page * reviewsPerPage,
    (page + 1) * reviewsPerPage
  );

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const [reviewFormOpen, setReviewFormOpen] = useState(false);

  return (
    <Card className={`border-none shadow-none ${className}`} style={style}>
      <CardHeader className="px-0 pt-0 pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-base font-medium">What people are saying</CardTitle>
        <Dialog open={reviewFormOpen} onOpenChange={setReviewFormOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Review
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
      </CardHeader>
      <CardContent className="px-0 py-1 space-y-4">
        {isLoading ? (
          <>
            <div className="h-24 bg-muted/30 animate-pulse rounded-lg"></div>
            <div className="h-24 bg-muted/30 animate-pulse rounded-lg"></div>
          </>
        ) : paginatedReviews.length > 0 ? (
          paginatedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No reviews available yet. Be the first to share your experience!
          </p>
        )}
        
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            <span className="text-xs text-muted-foreground">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}