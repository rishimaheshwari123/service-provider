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
        All Reviews and Ratings
      </h3>

      {allRatings && allRatings.length > 0 ? (
        <div className="flex flex-col gap-6">
          {allRatings.map((rating, index) => {
            const firstLetter = (
              rating?.user?.fName?.[0] ||
              rating?.user?.lName?.[0] ||
              "U"
            ).toUpperCase();

            return (
              <div
                key={index}
                className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
                    {firstLetter}
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg">
                      {`${rating?.user?.fName || ""} ${
                        rating?.user?.lName || ""
                      }`}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </p>
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
                    {getRatingDescription(rating.rating)}
                  </p>
                </div>

                <p className="mt-4 text-gray-700">{rating.review}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">No reviews available.</p>
      )}
    </div>
  );
};

export default AllRating;
