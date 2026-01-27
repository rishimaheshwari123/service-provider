import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAllReatingAPI } from "@/service/operations/rating";
import { RootState } from "@/redux/store";
import ReviewRating from "./ReviewRating";
import AllRating from "./AllRating";

const DisplayRating = ({ property }) => {
  const [reviewModal, setReviewModal] = useState(false);
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [allRatings, setAllRatings] = useState([]);
  const [propertyRatings, setPropertyRatings] = useState([]);

  const fetchRatings = async () => {
    try {
      const response = await getAllReatingAPI();
      console.log("All ratings from API:", response);
      setAllRatings(response);
      
      // Filter ratings for this specific property
      if (property && property._id) {
        console.log("Current property ID:", property._id);
        const filteredRatings = response.filter(
          (rating: any) => {
            console.log(`Comparing rating.property: ${rating.property} with property._id: ${property._id}`);
            return rating.property === property._id;
          }
        );
        console.log(`Found ${filteredRatings.length} reviews for property ${property._id}`);
        console.log("Filtered ratings:", filteredRatings);
        setPropertyRatings(filteredRatings);
      } else {
        console.log("No property or property._id found:", property);
      }
    } catch (error) {
      console.log("Error fetching ratings:", error);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [property]);

  const handleAddRating = () => {
    if (token) {
      setReviewModal(true);
    }
  };

  return (
    <div>
      <br />
      {/* Debug info */}
      {property && (
        <div className="max-w-7xl mx-auto p-4">
          <p className="text-sm text-gray-500 mb-2">
           Total Reviews: {propertyRatings.length}
          </p>
        </div>
      )}
      
      {/* Show property-specific ratings or empty state */}
      <AllRating allRatings={propertyRatings} />
      <br />

      {["user", "admin", "vendor"].includes(user?.role) && (
        <div className="max-w-7xl mx-auto p-4 flex justify-center">
          <button
            onClick={handleAddRating}
            className="bg-yellow-600 px-4 py-2 text-white rounded-lg"
          >
            Add Rating
          </button>
        </div>
      )}
      {reviewModal && (
        <ReviewRating
          setReviewModal={setReviewModal}
          property={property}
          userId={user._id}
          fetchRatings={fetchRatings}
        />
      )}
    </div>
  );
};

export default DisplayRating;
