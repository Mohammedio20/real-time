import { useState } from "react";
import UserList from "./userList";
import Search from "./search";
function Sidebar({ socket, onlineUsers }) {
  const [searchKey, setSearchKey] = useState("");
  return (
    <div className="app-sidebar">
      <Search searchKey={searchKey} setSearchKey={setSearchKey}></Search>
      <UserList
        searchKey={searchKey}
        socket={socket}
        onlineUsers={onlineUsers}
      ></UserList>
    </div>
  );
}

export default Sidebar;
