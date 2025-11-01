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

  const fetchRatings = async () => {
    try {
      const response = await getAllReatingAPI();
      setAllRatings(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const handleAddRating = () => {
    if (token) {
      setReviewModal(true);
    }
  };

  return (
    <div>
      <br />
      {allRatings.length > 0 && <AllRating allRatings={allRatings} />}
      <br />

      {["user", "admin"].includes(user?.role) && (
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
