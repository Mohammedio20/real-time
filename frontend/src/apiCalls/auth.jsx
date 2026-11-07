import { axiosInstance, url } from "./index";

export const signupUser = async (user) => {
  try {
    const response = await axiosInstance.post(
      url + "/api/v1/users/signup",
      user,
    );
    return response.data;
  } catch (err) {
    return err;
  }
};

export const loginUser = async (user) => {
  const response = await axiosInstance.post(url + "/api/v1/users/login", user);
  return response.data;
};
