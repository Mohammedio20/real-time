import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: { user: null, allUsers: [], allChats: [], selectedChat: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setAllUsers: (state, action) => {
      state.allUsers = action.payload;
    },
    setAllChats: (state, action) => {
      state.allChats = action.payload;
    },
    updateChat: (state, action) => {
      const updatedChat = action.payload;
      const chatIndex = state.allChats.findIndex(
        (chat) => String(chat._id) === String(updatedChat._id),
      );
      const currentLastMessage =
        chatIndex >= 0
          ? state.allChats[chatIndex].lastMessage?._id ??
            state.allChats[chatIndex].lastMessage
          : null;
      const updatedLastMessage =
        updatedChat.lastMessage?._id ?? updatedChat.lastMessage;
      const hasNewLastMessage =
        updatedLastMessage != null &&
        String(currentLastMessage) !== String(updatedLastMessage);

      state.allChats = state.allChats.filter(
        (chat) => String(chat._id) !== String(updatedChat._id),
      );
      if (hasNewLastMessage || chatIndex < 0) {
        state.allChats.unshift(updatedChat);
      } else {
        state.allChats.splice(chatIndex, 0, updatedChat);
      }

      if (String(state.selectedChat?._id) === String(updatedChat._id)) {
        state.selectedChat = updatedChat;
      }
    },
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },
  },
});

export const {
  setUser,
  setAllUsers,
  setAllChats,
  setSelectedChat,
  updateChat,
} = userSlice.actions;
export default userSlice.reducer;
