import { useDispatch, useSelector } from "react-redux";
import { createNewMessage, getAllMessages } from "../../../apiCalls/message";
import toast from "react-hot-toast";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import moment from "moment";
import { clearUnreadMessagesCount } from "../../../apiCalls/chats";
import { setSelectedChat, updateChat } from "../../../redux/userSlice";
import store from "../../../redux/store";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

const EMPTY_MESSAGES = [];

function ChatArea({ socket }) {
  const dispatch = useDispatch();
  const { selectedChat, user } = useSelector((state) => state.userReducer);
  const selectedUser = selectedChat?.members?.find((u) => u._id !== user._id);
  const lastMessageSender =
    selectedChat?.lastMessage?.sender?._id ?? selectedChat?.lastMessage?.sender;

  const [message, setMessage] = useState("");
  const [messagesByChat, setMessagesByChat] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const allMessages = messagesByChat[selectedChat?._id] ?? EMPTY_MESSAGES;
  const messageListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  }, [allMessages]);

  const sendMessage = async (image) => {
    if (!message.trim() && !image) {
      return;
    }

    try {
      const newMessage = {
        chatId: selectedChat._id,
        sender: user._id,
        content: message.trim(),
        image: image,
      };

      const response = await createNewMessage(newMessage);

      if (response.status === "success") {
        const savedMessage = response.data.message;
        const messageToBroadcast = {
          ...savedMessage,
          ...newMessage,
          chatId: selectedChat._id,
          members: selectedChat.members.map((member) => member._id),
          read: savedMessage.read ?? false,
        };

        socket.emit("send-message", messageToBroadcast);
        setMessagesByChat((messagesByChat) => {
          const messages = messagesByChat[selectedChat._id] || [];
          const updatedMessages = messages.some(
            (existingMessage) =>
              savedMessage._id != null &&
              String(existingMessage._id) === String(savedMessage._id),
          )
            ? messages
            : [...messages, savedMessage];

          return { ...messagesByChat, [selectedChat._id]: updatedMessages };
        });
        dispatch(
          updateChat({
            ...selectedChat,
            lastMessage: savedMessage,
            updatedAt: savedMessage.createdAt,
          }),
        );
        setMessage("");
        setShowEmojiPicker(false);
        toast.success(response.message);
      } else {
        toast.error(response.message || "Unable to send message.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to send message.",
      );
      console.error("Could not send message:", error);
    }
  };

  const formatTime = (timestamp) => {
    const messageTime = moment(
      timestamp,
      [moment.ISO_8601, "DD-MM-YYYY HH:mm:ss", "DD-MM-YYYY hh:mm:ss"],
      true,
    );

    if (!messageTime.isValid()) {
      return "";
    }

    if (messageTime.isSame(moment(), "day")) {
      return `Today ${messageTime.format("hh:mm A")}`;
    } else if (messageTime.isSame(moment().subtract(1, "day"), "day")) {
      return `Yesterday ${messageTime.format("hh:mm A")}`;
    } else {
      return messageTime.format("MMM D");
    }
  };
  function formatName(user) {
    let fname =
      user.firstName.at(0).toUpperCase() +
      user.firstName.slice(1).toLowerCase();
    let lname =
      user.lastName?.at(0).toUpperCase() + user.lastName.slice(1).toLowerCase();
    return fname + " " + lname;
  }

  const sendImage = async (e) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    input.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Choose a valid image file.");
      return;
    }

    if (file.size > 7 * 1024 * 1024) {
      toast.error("Choose an image smaller than 7 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      toast.error("Unable to read the selected image.");
    };
    reader.onload = () => {
      if (typeof reader.result === "string") {
        sendMessage(reader.result);
      } else {
        toast.error("Unable to read the selected image.");
      }
    };
    reader.readAsDataURL(file);
  };

  const clearUnreadMessages = useCallback(async () => {
    if (!selectedChat.unreadMessages) {
      return;
    }

    try {
      socket.emit("clear-unread-messages", {
        chatId: selectedChat._id,
        members: selectedChat.members.map((m) => m._id),
      });
      const response = await clearUnreadMessagesCount(selectedChat._id);

      if (response.status === "success") {
        dispatch(updateChat(response.data.updatedChat));
      } else {
        toast.error(response.message || "Unable to clear unread messages.");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Unable to clear unread messages.",
      );
    }
  }, [
    dispatch,
    selectedChat._id,
    selectedChat.members,
    selectedChat.unreadMessages,
    socket,
  ]);

  useEffect(() => {
    let isCurrentChat = true;
    const chatId = selectedChat._id;

    const getMessages = async () => {
      try {
        const response = await getAllMessages(selectedChat._id);

        if (isCurrentChat && response.status === "success") {
          setMessagesByChat((messagesByChat) => {
            const messages = messagesByChat[chatId] || [];
            const fetchedMessages = response.data.messages;
            const fetchedIds = new Set(
              fetchedMessages.map((message) => String(message._id)),
            );

            return {
              ...messagesByChat,
              [chatId]: [
                ...fetchedMessages,
                ...messages.filter(
                  (message) => !fetchedIds.has(String(message._id)),
                ),
              ],
            };
          });
        } else if (isCurrentChat) {
          toast.error(response.message || "Unable to load messages.");
        }
      } catch (error) {
        if (isCurrentChat) {
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Unable to load messages.",
          );
          console.error("Could not load messages:", error);
        }
      }
    };
    const handleReceiveMessage = (data) => {
      const messageChatId = data.chatId?._id ?? data.chatId;
      if (String(selectedChat._id) === String(messageChatId)) {
        setMessagesByChat((messagesByChat) => {
          const messages = messagesByChat[chatId] || [];
          const updatedMessages = messages.some(
            (existingMessage) =>
              data._id != null &&
              String(existingMessage._id) === String(data._id),
          )
            ? messages
            : [...messages, data];

          return { ...messagesByChat, [chatId]: updatedMessages };
        });
        const activeChat = store.getState().userReducer.selectedChat;
        dispatch(
          updateChat({
            ...activeChat,
            lastMessage: data,
            updatedAt: data.createdAt,
          }),
        );
      }
    };
    const handleMessageCountCleared = (data) => {
      const { selectedChat: activeChat, allChats } =
        store.getState().userReducer;
      if (String(activeChat?._id) === String(data.chatId)) {
        const activeChatData = allChats.find(
          (chat) => String(chat._id) === String(data.chatId),
        );
        if (activeChatData) {
          dispatch(updateChat({ ...activeChatData, unreadMessages: 0 }));
        }
        setMessagesByChat((messagesByChat) => ({
          ...messagesByChat,
          [selectedChat._id]: (messagesByChat[selectedChat._id] || []).map(
            (message) => ({ ...message, read: true }),
          ),
        }));
      }
    };
    const handleStartedTyping = (data) => {
      const typingChatId = data.chatId?._id ?? data.chatId;
      const typingSender = data.sender?._id ?? data.sender;
      if (
        String(typingChatId) === String(chatId) &&
        String(typingSender) !== String(user._id)
      ) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    };
    socket.on("received-message", handleReceiveMessage);
    socket.on("message-count-cleared", handleMessageCountCleared);
    socket.on("started-typing", handleStartedTyping);
    getMessages();
    if (
      selectedChat.unreadMessages > 0 &&
      String(lastMessageSender) !== String(user._id)
    ) {
      clearUnreadMessages();
    }
    return () => {
      isCurrentChat = false;
      socket.off("received-message", handleReceiveMessage);
      socket.off("message-count-cleared", handleMessageCountCleared);
      socket.off("started-typing", handleStartedTyping);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [
    clearUnreadMessages,
    dispatch,
    socket,
    selectedChat._id,
    selectedChat.unreadMessages,
    lastMessageSender,
    user._id,
  ]);

  useEffect(() => {
    const msgContainer = document.getElementById("main-chat-area");
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }, [allMessages, isTyping]);

  return (
    <>
      {selectedChat && (
        <div className="app-chat-area">
          <div className="app-chat-area-header">
            <button
              type="button"
              className="mobile-chat-back"
              aria-label="Back to conversations"
              onClick={() => dispatch(setSelectedChat(null))}
            >
              <i className="fa fa-arrow-left" aria-hidden="true" />
            </button>
            <span>{formatName(selectedUser)}</span>
          </div>

          <div
            className="main-chat-area"
            id="main-chat-area"
            ref={messageListRef}
          >
            {allMessages.map((msg) => {
              const isCurrentUserSender =
                String(msg.sender?._id ?? msg.sender) === String(user._id);

              return (
                <div
                  className="message-container"
                  key={msg._id}
                  style={
                    isCurrentUserSender
                      ? { justifyContent: "end" }
                      : { justifyContent: "start" }
                  }
                >
                  <div>
                    <div
                      className={
                        isCurrentUserSender
                          ? "send-message"
                          : "received-message"
                      }
                    >
                      <div> {msg.content}</div>
                      <div>
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="image"
                            height="120"
                            width="120"
                          ></img>
                        )}
                      </div>
                    </div>

                    <div
                      className="message-timestamp"
                      style={
                        isCurrentUserSender
                          ? { float: "right" }
                          : { float: "left" }
                      }
                    >
                      {formatTime(msg.createdAt)}{" "}
                      {isCurrentUserSender && msg.read && (
                        <span
                          className="read-message-icon"
                          aria-label="Read"
                          title="Read"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="typing-indcator">
              {isTyping && <i>typing...</i>}
            </div>
          </div>
          {showEmojiPicker && (
            <div className="emoji-picker-container">
              <Suspense fallback={null}>
                <EmojiPicker
                  onEmojiClick={(emoji) =>
                    setMessage((currentMessage) => currentMessage + emoji.emoji)
                  }
                />
              </Suspense>
            </div>
          )}
          <div className="send-message-div">
            <input
              type="text"
              className="send-message-input"
              placeholder="Type a message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                socket.emit("user-typing", {
                  chatId: selectedChat._id,
                  members: selectedChat.members.map((m) => m._id),
                  sender: user._id,
                });
              }}
            />
            <label>
              <img
                src="/image-upload.svg"
                alt="Choose an image to send"
                className="send-image-btn"
              />
              <input
                type="file"
                id="file"
                style={{ display: "none" }}
                accept="image/jpg,image/png,image/jpeg,image/gif"
                onChange={sendImage}
              ></input>
            </label>
            <button
              type="button"
              className="send-emoji-btn"
              aria-label="Toggle emoji picker"
              aria-expanded={showEmojiPicker}
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
              }}
            >
              😊
            </button>

            <button
              type="button"
              className="fa fa-paper-plane send-message-btn"
              aria-label="Send message"
              onClick={() => sendMessage()}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default ChatArea;
