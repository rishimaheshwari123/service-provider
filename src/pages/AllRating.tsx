import React from "react";
import ReactStars from "react-rating-stars-component";

const AllRating = ({ allRatings }) => {
  const getRatingDescription = (rating) => {
    if (rating < 2) return "Poor";
    if (rating < 3) return "Good";
    if (rating < 4) return "Very Good";
    return "Excellent";
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h3 className="text-center text-2xl font-bold mb-6">
        Reviews and Ratings ({allRatings.length})
      </h3>

      {allRatings && allRatings.length > 0 ? (
        <div className="flex flex-col gap-6">
          {allRatings.map((rating, index) => {
            // Handle both guest users and registered users
            const userName = rating.guestName || 
                           `${rating?.user?.fName || ""} ${rating?.user?.lName || ""}`.trim() ||
                           rating?.user?.name ||
                           "Anonymous User";
            
            const firstLetter = (
              rating.guestName?.[0] ||
              rating?.user?.fName?.[0] ||
              rating?.user?.lName?.[0] ||
              rating?.user?.name?.[0] ||
              "U"
            ).toUpperCase();

            return (
              <div
                key={rating._id || index}
                className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
                    {firstLetter}
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg">
                      {userName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </p>
                    {rating.guestName && (
                      <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mt-1">
                        Guest Review
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <ReactStars
                    count={5}
                    value={rating.rating}
                    size={24}
                    edit={false}
                    isHalf={true}
                    activeColor="#ffd700"
                  />
                  <p className="mt-2 text-sm text-gray-600 font-semibold">
                    {getRatingDescription(rating.rating)} ({rating.rating}/5)
                  </p>
                </div>

                <p className="mt-4 text-gray-700">{rating.review}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ReactStars
              count={1}
              value={1}
              size={32}
              edit={false}
              activeColor="#ffd700"
            />
          </div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">No reviews yet</h4>
          <p className="text-gray-500">Be the first to review this service!</p>
        </div>
      )}
    </div>
  );
};

export default AllRating;
