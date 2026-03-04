// src/components/chat/ChatSidebar.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axiosApi from "../../utils/api.js";
import { InputGroup, Form, Tabs, Tab } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import ChatTab from "./ChatTab";
import GroupTab from "./groupChat/GroupTab.jsx";
import { useChatSocket } from "./useChatSocket.js";
import io from "socket.io-client";

import '../../App.css'


const SOCKET_URL = "http://localhost:4000";
const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
});

function ChatSidebar({ selectedUser, onUserClick, selectedGroup, onGroupClick, users, setUsers }) {
  const [activeTab, setActiveTab] = useState("chats");
  const [searchItem, setSearchItem] = useState("");
  const [searchGroup, setSearchGroup] = useState("")
  // const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]); // placeholder for groups
  const [userOnline, setUserOnline] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());

  // const [userOnline, setUserOnline] = useState(new Set());

  // const { user: currentUser } = useAuth();

  const filteredUsers = useMemo(() => {
    return (users || []).filter(u =>
      u.name?.toLowerCase().includes(searchItem.toLowerCase()) ||
      u.mobNo?.includes(searchItem)
    );
  }, [users, searchItem]); // It now explicitly watches 'users'



  const filteredGroups = useMemo(() => {
    return groups.filter(g =>
      g.name?.toLowerCase().includes(searchGroup.toLowerCase())
    );
  }, [groups, searchGroup]);

  // Fetch users
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const res = await axiosApi.get("/auth/users", {
  //         params: { q: searchItem }
  //       });
  //       const otherUsers = res.data?.users?.filter(u => u._id !== currentUser?._id) || [];
  //       setUsers(otherUsers);
  //     } catch (error) {
  //       console.error("Failed to fetch users:", error.message);
  //     }
  //   };
  //   if (currentUser) fetchUsers();
  // }, [currentUser]);



  // Socket listeners
 
  
  
  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on("userOnline", (userId) => {
      setUserOnline(prev => new Set([...prev, userId]));
    });

    socket.on("onlineUsersList", (ids) => {
      setUserOnline(new Set(ids));
    });

    socket.on("user_typing", ({ senderId }) => {
      setTypingUsers(prev => new Set([...prev, senderId]));
    });

    socket.on("user_stopped_typing", ({ senderId }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(senderId);
        return next;
      });
    });

    socket.on("userOffline", ({ userId }) => {
      setUserOnline(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      socket.off("userOnline");
      socket.off("onlineUsersList");
      socket.off("user_typing");
      socket.off("user_stopped_typing");
      socket.off("userOffline");
    };
  }, []);





  // fetch groups when tab changes
  const fetchGroups = async () => {
    try {
      const res = await axiosApi.get("/group/my-groups")
      setGroups(res.data?.groups); // placeholder

    } catch (error) {
      console.log(error.message)
    }
  }
  useEffect(() => {
    if (activeTab === "groups") {

      fetchGroups()
    }
  }, [activeTab]);

  return (
    <div
      className="bg-light border-end d-flex flex-column"
      style={{
        width: "280px",
        minWidth: "280px",
        height: "100%",
      }}
    >
      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="border-bottom"
        fill
      >
        <Tab eventKey="chats" title="Chats" />
        <Tab eventKey="groups" title="Groups" />
      </Tabs>

      {/* Search */}
      <div className="p-3 border-bottom">
        <InputGroup>
          <InputGroup.Text className="search-icon-1"><FaSearch /></InputGroup.Text>
          <Form.Control
            placeholder={activeTab === "chats" ? "Search name or MobNo" : "Search groups"}
            value={activeTab === "chats" ? searchItem : searchGroup}
            onChange={activeTab === "chats" ? (e) => setSearchItem(e.target.value) : (e) => setSearchGroup(e.target.value)}
            style={{ borderLeft: "none" }}
          />

        </InputGroup>
      </div>

      {/* Tab Content */}
      <div className="flex-grow-1 overflow-auto">
        {activeTab === "chats" ? (
          <ChatTab
            filteredUsers={filteredUsers}
            selectedUser={selectedUser}
            onUserClick={onUserClick}
            userOnline={userOnline}
            typingUsers={typingUsers}
          />
        ) : (
          <GroupTab groups={filteredGroups} selectedGroup={selectedGroup} onGroupClick={onGroupClick} fetchGroups={fetchGroups} />
        )}
      </div>
    </div>
  );
}

export default ChatSidebar;