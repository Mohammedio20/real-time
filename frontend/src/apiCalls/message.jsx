import { axiosInstance, url } from "./index";

export const createNewMessage = async (message) => {
  const response = await axiosInstance.post(url + "/api/v1/messages", message);
  return response.data;
};

export const getAllMessages = async (chatId) => {
  const response = await axiosInstance.get(url + `/api/v1/messages/${chatId}`);
  return response.data;
};
