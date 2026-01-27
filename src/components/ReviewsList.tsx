import { useState, useEffect } from "react";
import { Star, User, Calendar } from "lucide-react";
import { getAllReatingAPI } from "@/service/operations/rating";

interface ReviewsListProps {
  serviceId: string;
  serviceName: string;
}

const ReviewsList = ({ serviceId, serviceName }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [serviceId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const allReviews = await getAllReatingAPI();
      const serviceReviews = allReviews.filter((review: any) => review.property === serviceId);
      setReviews(serviceReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return parseFloat((total / reviews.length).toFixed(1));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-500";
    if (rating >= 3) return "text-yellow-500";
    if (rating >= 2) return "text-orange-500";
    return "text-red-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Reviews for {serviceName}
        </h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 font-semibold">{getAverageRating()}</span>
            </div>
            <span className="text-gray-500">({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">No reviews yet</h4>
          <p className="text-gray-500">Be the first to review this service!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div key={review._id || index} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {review.guestName || review.user?.name || "Anonymous User"}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`text-sm font-medium ${getRatingColor(review.rating)}`}>
                          {review.rating}/5
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.review}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;