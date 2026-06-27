import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { ratingEndpoints } from "../apis";
const {
  ADD_RATING_API,

  GETALL_RATING_API,
} = ratingEndpoints;


// Rating Review
export const addRating = async (formData, token) => {
  console.log(formData);
  const toastId = toast.loading("Loading...");
  try {
    // Make the API call
    const response = await apiConnector("POST", ADD_RATING_API, formData, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    });


    if (!response?.data?.success) {
      throw new Error("Could not ADD_RATING_API details");
    }

    toast.success("Rating Send Successfull");
  } catch (error) {
    toast.error(error?.response?.data?.message);
    console.log(error);
  }

  toast.dismiss(toastId);
};

export const getAllReatingAPI = async () => {
  try {
    console.log("Fetching all reviews from API...");
    const response = await apiConnector("GET", GETALL_RATING_API);

    if (!response?.data?.success) {
      console.error("Rating API returned unsuccessful response:", response?.data);
      throw new Error("Could not fetch reviews");
    }
    
    const reviews = response?.data?.allReviews || [];
    return reviews;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return []; // Return empty array instead of false
  }
};




