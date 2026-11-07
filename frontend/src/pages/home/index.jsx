import Header from "./components/header";
import Sidebar from "./components/sidebar";
import ChatArea from "./components/chat";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io(`http://localhost:3000`);

function Home() {
  const { selectedChat, user } = useSelector((state) => state.userReducer);
  const [onlineUsers, setOnlineUser] = useState([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const joinRoom = () => {
      socket.emit("join-room", user._id);
      socket.emit("user-login", user._id);
    };

    const handleOnlineUsers = (onlineUsers) => {
      setOnlineUser(onlineUsers);
    };

    socket.on("online-user-updated", handleOnlineUsers);

    socket.on("connect", joinRoom);
    socket.on("online-user", handleOnlineUsers);
    if (socket.connected) {
      joinRoom();
    }

    return () => {
      socket.off("connect", joinRoom);
      socket.off("online-user", handleOnlineUsers);
      socket.off("online-user-updated", handleOnlineUsers);
    };
  }, [user]);

  return (
    <div className="home-page">
      <Header socket={socket}></Header>
      <div className={`main-content${selectedChat ? " chat-open" : ""}`}>
        <Sidebar socket={socket} onlineUsers={onlineUsers}></Sidebar>
        {selectedChat && <ChatArea socket={socket}></ChatArea>}
      </div>
    </div>
  );
}

export default Home;
