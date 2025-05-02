import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon } from "lucide-react";
import { Review } from "@shared/schema";

interface ReviewCardProps {
  review: Review;
  className?: string;
  style?: React.CSSProperties;
}

export default function ReviewCard({ review, className = "", style }: ReviewCardProps) {
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  // Render star rating
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

  return (
    <div
      className={`bg-background/80 rounded-lg p-4 border border-muted/40 ${className}`}
      style={style}
    >
      <div className="flex items-center mb-2">
        <Avatar className="h-8 w-8 mr-2">
          {review.avatarUrl ? (
            <AvatarImage src={review.avatarUrl} alt={review.name} />
          ) : (
            <AvatarFallback>{getInitials(review.name)}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">{review.name}</p>
            {review.rating && renderRating(review.rating)}
          </div>
          {review.title && (
            <p className="text-xs text-muted-foreground">{review.title}</p>
          )}
        </div>
      </div>
      <p className="text-sm italic">{review.content}</p>
    </div>
  );
}