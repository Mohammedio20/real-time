import { axiosInstance, url } from "./index";
export const getAllChats = async () => {
  try {
    const response = await axiosInstance.get(url + "/api/v1/chats");
    return response.data;
  } catch (err) {
    return err;
  }
};

export const createNewChat = async (members) => {
  const response = await axiosInstance.post(url + "/api/v1/chats", { members });
  return response.data;
};

export const getAllMessages = async (chatId) => {
  try {
    const response = await axiosInstance.post(
      url + `/api/v1/messages/${chatId}`,
    );
    return response.data;
  } catch (err) {
    return err;
  }
};

export const clearUnreadMessagesCount = async (chatId) => {
  try {
    const response = await axiosInstance.post(url + "/api/v1/chats/read", {
      chatId: chatId,
    });
    return response.data;
  } catch (err) {
    return err;
  }
};
