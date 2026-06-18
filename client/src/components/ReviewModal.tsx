import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, X } from "lucide-react";
import { addRating } from "@/service/operations/rating";
import { toast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  onReviewAdded: () => void;
}

const ReviewModal = ({ isOpen, onClose, serviceId, serviceName, onReviewAdded }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useSelector((state: RootState) => state.auth?.user ?? null);

  const handleCancel = () => {
    setRating(0);
    setHoveredRating(0);
    setReviewText("");
    setUserName("");
    setUserEmail("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating || !reviewText.trim()) {
      toast({
        title: "Error",
        description: "Please provide both rating and review text",
        variant: "destructive",
      });
      return;
    }

    if (!user && (!userName.trim() || !userEmail.trim())) {
      toast({
        title: "Error", 
        description: "Please provide your name and email",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create form data for the review
      const formData = new FormData();
      formData.append("rating", rating.toString());
      formData.append("review", reviewText.trim());
      formData.append("property", serviceId);
      
      // If user is logged in, use their ID, otherwise create a guest user
      if (user) {
        formData.append("userId", user._id);
      } else {
        // For guest users, we'll use a temporary approach
        // In production, you might want to create a guest user or handle this differently
        formData.append("userId", "guest-user-id");
        formData.append("guestName", userName.trim());
        formData.append("guestEmail", userEmail.trim());
      }

      const token = localStorage.getItem("token") || "guest-token";
      await addRating(formData, token);

      toast({
        title: "Success",
        description: "Review added successfully!",
      });

      // Reset form
      setRating(0);
      setReviewText("");
      setUserName("");
      setUserEmail("");
      
      // Notify parent component to refresh reviews
      onReviewAdded();
      onClose();
    } catch (error) {
      console.error("Error adding review:", error);
      toast({
        title: "Error",
        description: "Failed to add review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Review</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Service Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Reviewing:</p>
            <p className="font-medium text-gray-900">{serviceName}</p>
          </div>

          {/* User Info (if not logged in) */}
          {!user && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="userName">Your Name *</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="userEmail">Your Email *</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
          )}

          {/* Rating */}
          <div>
            <Label>Rating *</Label>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating > 0 && `${rating} star${rating > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <Label htmlFor="reviewText">Your Review *</Label>
            <Textarea
              id="reviewText"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this service..."
              rows={4}
              required
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              {reviewText.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !rating || !reviewText.trim()}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;