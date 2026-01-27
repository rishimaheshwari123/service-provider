import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { RxCross2 } from "react-icons/rx";
import ReactStars from "react-rating-stars-component";
import { useSelector } from "react-redux";

import { addRating } from "@/service/operations/rating";
import { RootState } from "@/redux/store";

export default function ReviewRating({
  setReviewModal,
  property,
  userId,
  fetchRatings,
}) {
  const { token, user } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setValue("userReview", "");
    setValue("userRating", 0);
  }, []);

  const ratingChanged = (newRating) => {
    setValue("userRating", newRating);
  };

  const onSubmit = async (data) => {
    const ratingData = {
      rating: data.userRating,
      review: data.userReview,
      userId,
      property: property._id, // Use property._id instead of complete property object
    };
    console.log("Submitting rating data:", ratingData);
    await addRating(ratingData, token);
    setReviewModal(false);
    fetchRatings();
  };

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-lg rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-gray-700 p-5 border-b border-gray-600">
          <p className="text-xl font-semibold text-gray-200">Add Review</p>
          <button onClick={() => setReviewModal(false)}>
            <RxCross2 className="text-2xl text-gray-200" />
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-6">
          <div className="flex items-center justify-center gap-x-4">
            <div>
              <p className="font-semibold text-gray-200">{user?.name}</p>
              <p className="text-sm text-gray-400">Posting Publicly</p>
            </div>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 flex flex-col items-center"
          >
            <div className="mt-4 flex justify-center">
              <ReactStars
                count={5}
                onChange={ratingChanged}
                size={36}
                value={0}
                activeColor="#FFD700"
                isHalf={false}
              />
            </div>
            <div className="flex w-full flex-col space-y-2 mt-4">
              <label className="text-sm text-gray-200" htmlFor="userReview">
                Add Your Experience <sup className="text-pink-300">*</sup>
              </label>
              <textarea
                id="userReview"
                placeholder="Add Your Experience"
                {...register("userReview", {
                  required: "Experience is required",
                })}
                className="resize-none min-h-[130px] w-full border border-gray-600 bg-gray-700 text-gray-200 rounded-md p-3"
              />
              {errors.userReview && (
                <span className="text-xs text-pink-300">
                  {String(errors.userReview.message)}
                </span>
              )}
            </div>
            <div className="mt-6 flex w-full justify-end gap-x-2">
              <button
                onClick={() => setReviewModal(false)}
                className="flex items-center gap-x-2 rounded-md bg-gray-600 py-2 px-4 font-semibold text-gray-200 hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-x-2 rounded-md bg-blue-500 py-2 px-4 font-semibold text-white hover:bg-blue-400"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
