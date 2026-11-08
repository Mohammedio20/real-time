import { axiosInstance, url } from "./index";

export const getLoggedUser = async () => {
  try {
    const response = await axiosInstance.get(url + "/api/v1/users/me");
    return response.data;
  } catch (err) {
    return err;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get(url + "/api/v1/users");
    return response.data;
  } catch (err) {
    return err;
  }
};

export const uploadProfilePic = async (image) => {
  const response = await axiosInstance.post(
    url + "/api/v1/users/upload-profile-pic",
    { image },
  );
  return response.data;
};
