import { useState, useEffect } from "react";
import ReactStars from "react-rating-stars-component";

const AllRating = ({ allRatings }) => {
  const getRatingDescription = (rating) => {
    if (rating < 2) return "Poor";
    if (rating < 3) return "Good";
    if (rating < 4) return "Very Good";
    return "Excellent";
  };

  // Typing animation component
  const TypingText = ({ text, delay = 50 }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, delay);
        return () => clearTimeout(timeout);
      }
    }, [currentIndex, text, delay]);

    useEffect(() => {
      setDisplayedText("");
      setCurrentIndex(0);
    }, [text]);

    return (
      <span className="inline-block">
        {displayedText}
        {currentIndex < text.length && (
          <span className="animate-pulse text-blue-500">|</span>
        )}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header with Logo and Title */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">MG</span>
          </div>
          {/* Title with custom font */}
          <h3 className="text-3xl font-extrabold bg-gradient-to-r from-red-500 via-purple-500 to-blue-600 bg-clip-text text-transparent">
            <span className="font-['Poppins',sans-serif] tracking-wide">
              MERA <span className="text-blue-600">GHAR SANSAAR</span>
            </span>
          </h3>
        </div>
      </div>

      {/* Reviews Count */}
      <div className="text-center mb-6">
        <h4 className="text-2xl font-bold text-gray-800 font-['Inter',sans-serif]">
          Reviews and Ratings ({allRatings.length})
        </h4>
        <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-blue-600 mx-auto mt-2 rounded-full"></div>
      </div>

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
                className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
              >
                <div className="flex items-center space-x-4">
                  {/* Enhanced Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xl font-bold shadow-lg ring-4 ring-blue-100">
                    {firstLetter}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-800 font-['Inter',sans-serif]">
                      {userName}
                    </h4>
                    <p className="text-sm text-gray-500 font-['Roboto',sans-serif]">
                      {new Date(rating.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    {rating.guestName && (
                      <span className="inline-block bg-gradient-to-r from-green-100 to-blue-100 text-green-700 text-xs px-3 py-1 rounded-full mt-1 font-medium">
                        ✨ Guest Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Enhanced Rating Section */}
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <ReactStars
                      count={5}
                      value={rating.rating}
                      size={28}
                      edit={false}
                      isHalf={true}
                      activeColor="#ffd700"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-800">
                        {rating.rating}/5
                      </span>
                      <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-semibold rounded-full">
                        {getRatingDescription(rating.rating)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Review Text with Typing Animation */}
                <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-gray-700 leading-relaxed font-['Inter',sans-serif] text-base">
                    <TypingText text={rating.review} delay={30} />
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ReactStars
              count={1}
              value={1}
              size={36}
              edit={false}
              activeColor="#ffd700"
            />
          </div>
          <h4 className="text-xl font-bold text-gray-700 mb-3 font-['Inter',sans-serif]">
            No reviews yet
          </h4>
          <p className="text-gray-500 font-['Roboto',sans-serif] text-lg">
            Be the first to review this service! ⭐
          </p>
          <div className="mt-4">
            <div className="w-32 h-1 bg-gradient-to-r from-gray-300 to-gray-400 mx-auto rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllRating;
