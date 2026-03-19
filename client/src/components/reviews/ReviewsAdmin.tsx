import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Review } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarIcon, Eye, EyeOff, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ReviewsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: reviews = [], isLoading, error } = useQuery<Review[]>({
    queryKey: ["/api/admin/reviews"],
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: number; isVisible: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/reviews/${id}`, { isVisible });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update review");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({
        title: "Review Updated",
        description: "Review visibility has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update review visibility.",
        variant: "destructive",
      });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/reviews/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete review");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({
        title: "Review Deleted",
        description: "The review has been permanently deleted.",
      });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review.",
        variant: "destructive",
      });
      setDeleteId(null);
    },
  });

  const handleToggleVisibility = (id: number, currentVisibility: boolean) => {
    toggleVisibilityMutation.mutate({ id, isVisible: !currentVisibility });
  };

  const handleDeleteReview = (id: number) => {
    if (id) {
      deleteReviewMutation.mutate(id);
    }
  };

  // Render stars for rating
  const renderRating = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-3 w-3 ${
              i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <p>Failed to load reviews. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Manage Reviews</h3>
        <div className="text-sm text-muted-foreground">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''} total
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">No reviews found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center mb-1">
                      <h4 className="font-medium text-sm">{review.name}</h4>
                      <div className="ml-2">{renderRating(review.rating)}</div>
                    </div>
                    {review.title && (
                      <p className="text-xs text-muted-foreground">{review.title}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className={`flex items-center text-xs px-2 py-1 rounded ${
                        review.isVisible 
                          ? "bg-green-100 text-green-800" 
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {review.isVisible ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" /> 
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" /> 
                          <span>Hidden</span>
                        </>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleToggleVisibility(review.id, review.isVisible)}
                      title={review.isVisible ? "Hide review" : "Make visible"}
                    >
                      {review.isVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <AlertDialog 
                      open={deleteId === review.id} 
                      onOpenChange={(open: boolean) => {
                        if (!open) setDeleteId(null);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                          onClick={() => setDeleteId(review.id)}
                          title="Delete review"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the review from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleDeleteReview(review.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <p className="text-sm mt-2">{review.content}</p>
                <div className="text-xs text-muted-foreground mt-2">
                  {review.createdAt && (
                    <>
                      Submitted on{" "}
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}