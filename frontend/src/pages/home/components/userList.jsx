import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createNewChat } from "./../../../apiCalls/chats";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import { setAllChats, setSelectedChat } from "../../../redux/userSlice";
import moment from "moment";
import { useEffect } from "react";
import store from "./../../../redux/store";

function UserList({ searchKey, socket, onlineUsers }) {
  const {
    allUsers,
    allChats,
    user: currentUser,
    selectedChat,
  } = useSelector((state) => state.userReducer);

  const normalizedSearchKey = searchKey.trim().toLowerCase();
  const dispatch = useDispatch();

  const getChatForUser = (userId) =>
    allChats.find((chat) => {
      const memberIds = chat.members.map((member) =>
        String(member?._id ?? member),
      );
      return (
        memberIds.length === 2 &&
        memberIds.includes(String(currentUser._id)) &&
        memberIds.includes(String(userId))
      );
    });

  const startNewChat = async (searchUserId) => {
    try {
      dispatch(showLoader());
      const existingChat = getChatForUser(searchUserId);
      if (existingChat) {
        dispatch(setSelectedChat(existingChat));
        return;
      }

      const response = await createNewChat([currentUser._id, searchUserId]);

      if (response.status === "success") {
        toast.success(response.message);
        const newChat = response.data.chat;
        const updatedChat = [...allChats, newChat];

        dispatch(setAllChats(updatedChat));
        dispatch(setSelectedChat(newChat));
      } else {
        toast.error(response.message || "Unable to start chat.");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Unable to start chat.",
      );
      console.error("Could not start chat:", err);
    } finally {
      dispatch(hideLoader());
    }
  };

  const openChat = (selectedUserId) => {
    const chat = getChatForUser(selectedUserId);

    if (chat) {
      dispatch(setSelectedChat(chat));
    }
  };

  const isSelectedChat = (user) => {
    if (selectedChat) {
      return selectedChat.members.some(
        (member) => String(member?._id ?? member) === String(user._id),
      );
    }
    return false;
  };

  const getLastMessageTimeStamp = (userId) => {
    const chat = getChatForUser(userId);

    if (!chat || !chat?.lastMessage) {
      return "";
    } else {
      return moment(chat?.lastMessage?.createdAt).format("hh:mm A");
    }
  };

  const getLastMessage = (userId) => {
    const chat = getChatForUser(userId);

    const lastMessage = chat?.lastMessage;

    if (!lastMessage?.content) {
      return "";
    }

    const msgPrefix =
      String(lastMessage.sender?._id ?? lastMessage.sender) ===
      String(currentUser._id)
        ? "You "
        : "";

    const content =
      lastMessage.content.length > 25
        ? `${lastMessage.content.slice(0, 25)}...`
        : lastMessage.content;

    return msgPrefix + content;
  };

  function formatName(user) {
    let fname =
      user.firstName.at(0).toUpperCase() +
      user.firstName.slice(1).toLowerCase();

    let lname =
      user.lastName?.at(0).toUpperCase() + user.lastName.slice(1).toLowerCase();

    return fname + " " + lname;
  }

  useEffect(() => {
    if (!socket) return;

    const handleReceivedMessage = (message) => {
      const selectedChat = store.getState().userReducer.selectedChat;
      const allChats = store.getState().userReducer.allChats;
      const messageChatId = String(message.chatId?._id ?? message.chatId);

      const updatedChats = allChats.map((chat) => {
        if (String(chat._id) === messageChatId) {
          return {
            ...chat,
            unreadMessages:
              String(selectedChat?._id) === messageChatId
                ? chat?.unreadMessages || 0
                : (chat?.unreadMessages || 0) + 1,
            lastMessage: message,
            updatedAt: message.createdAt,
          };
        }
        return chat;
      });

      const latestChat = updatedChats.find(
        (chat) => String(chat._id) === messageChatId,
      );
      const otherChats = updatedChats.filter(
        (chat) => String(chat._id) !== messageChatId,
      );
      dispatch(
        setAllChats(latestChat ? [latestChat, ...otherChats] : updatedChats),
      );
    };

    socket.on("received-message", handleReceivedMessage);

    return () => {
      socket.off("received-message", handleReceivedMessage);
    };
  }, [socket, dispatch]);

  const getUnreadMessageCount = (userId) => {
    const chat = getChatForUser(userId);

    const lastMessageSender =
      chat?.lastMessage?.sender?._id ?? chat?.lastMessage?.sender;

    if (
      chat &&
      chat.unreadMessages > 0 &&
      String(lastMessageSender) !== String(currentUser._id)
    ) {
      return <div className="unread-message-count">{chat.unreadMessages}</div>;
    } else {
      return "";
    }
  };

  const isOnline = (userId) =>
    Array.isArray(onlineUsers) &&
    onlineUsers.some(
      (onlineUser) =>
        String(onlineUser?._id ?? onlineUser) === String(userId),
    );

  if (!currentUser?._id) {
    return null;
  }

  const getData = () => {
    const users = allUsers.filter(
      (user) =>
        !normalizedSearchKey ||
        user.firstName.toLowerCase().includes(normalizedSearchKey) ||
        user.lastName?.toLowerCase().includes(normalizedSearchKey),
    );

    return users.sort((userA, userB) => {
      const chatA = getChatForUser(userA._id);
      const chatB = getChatForUser(userB._id);
      const latestTimeA = moment(
        chatA?.lastMessage?.createdAt ??
          chatA?.updatedAt ??
          chatA?.createdAt ??
          0,
      ).valueOf();
      const latestTimeB = moment(
        chatB?.lastMessage?.createdAt ??
          chatB?.updatedAt ??
          chatB?.createdAt ??
          0,
      ).valueOf();

      return (
        latestTimeB - latestTimeA ||
        formatName(userA).localeCompare(formatName(userB))
      );
    });
  };

  return getData().map((user) => {
    const profilePic = user.profilePic ?? user.photo;

    return (
      <div
        className="user-search-filter"
        key={user._id}
        onClick={() => openChat(user._id)}
      >
        <div
          className={isSelectedChat(user) ? "selected-user" : "filtered-user"}
        >
          <div className="filter-user-display">
            {profilePic && (
              <img
                src={profilePic}
                alt="Profile Pic"
                className="user-profile-image"
                style={
                  isOnline(user._id)
                    ? { border: "#82e0aa 3px solid" }
                    : {}
                }
              />
            )}

            {!profilePic && (
              <div
                className={
                  isSelectedChat(user)
                    ? "user-selected-avatar"
                    : "user-default-avatar"
                }
                style={
                  isOnline(user._id)
                    ? { border: "#82e0aa 3px solid" }
                    : {}
                }
              >
                {user.firstName.charAt(0).toUpperCase() +
                  user.lastName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="filter-user-details">
              <div className="user-display-name">{formatName(user)}</div>

              <div className="user-display-email">
                {getLastMessage(user._id) || user.email}
              </div>
            </div>

            <div>
              {getUnreadMessageCount(user._id)}
              <div className="last-message-timestamp">
                {getLastMessageTimeStamp(user._id)}
              </div>
            </div>

            {!getChatForUser(user._id) && (
              <div className="user-start-chat">
                <button
                  className="user-start-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    startNewChat(user._id);
                  }}
                >
                  Start Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });
}

export default UserList;
