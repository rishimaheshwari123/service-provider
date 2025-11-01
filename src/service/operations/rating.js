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

    console.log("ADD_RATING_API API RESPONSE............", response);

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
  let result = [];
  try {
    const response = await apiConnector("GET", GETALL_RATING_API);


    if (!response?.data?.success) {
      throw new Error("Could not UPDATE_RATING_API details");
    }
    result = response?.data?.allReviews
    return result;
  } catch (error) {
    console.log(error);
    return false
  }

};




